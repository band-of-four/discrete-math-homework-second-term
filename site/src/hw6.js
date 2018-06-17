import { h } from 'preact';
import { rlog, rmatrix, rmatrixHeadered } from './r.js';
import { findIndexes, findIndexesBy, chunks, sum, mutRemoveIndex } from './enumerable.js';

export default function(matrix) {
  const transformLog = mutTransformToEulerian(matrix);
  const [ cycle, cycleLog ] = findEulerianCycle(matrix);

  return (
    <div>
      {(transformLog.length > 0) ?
        (
          <div>
            <h2>Приведение графа к содержащему цикл</h2>
            {rlog(transformLog)}
            {rmatrixHeadered(matrix, matrix.map((_, i) => `$x_{${i + 1}}$`))}
          </div>
        ) : ''}
      <h2>Нахождение цикла</h2>
      {rlog(cycleLog)}
      ${cycle.map((v) => `x_{${v + 1}}`).join(' \\rightarrow ')}$
    </div>
  );
}

// https://github.com/band-of-four/discrete-math-homework-second-term/blob/b1bcfd220c63f5a8499ea6c7181b36d18360bef5/to_euler_graph.ipynb
function mutTransformToEulerian(matrix) {
  const unevenRowIndexes = findIndexesBy(matrix, (row) => row.filter((el) => el === 1).length % 2 !== 0);

  if (unevenRowIndexes.length === 0) return [];

  const log = [`Строки с нечетным числом соединений: ${unevenRowIndexes.map((i) => i + 1).join(', ')}`];

  if (unevenRowIndexes.length % 2 !== 0) {
    const droppedRowIndex = unevenRowIndexes.shift();
    mutRemoveIndex(matrix, droppedRowIndex);
    matrix.forEach((row) => mutRemoveIndex(row, droppedRowIndex));

    log.push(`Т.к. в матрице нельзя построить эйлеров цикл без боли, удалим вершину #${droppedRowIndex + 1}`);
  }
  
  chunks(unevenRowIndexes, 2).forEach(([i, j]) => {
    if (matrix[i][j] === 0) log.push(`Соединим вершину $x_{${i + 1}}$ с вершиной $x_{${j + 1}}$`);
    else log.push(`Удалим ребро между вершинами $x_{${i + 1}}$ и $x_{${j + 1}}$`);

    matrix[i][j] = (matrix[i][j] === 0) ? 1 : 0;
    matrix[j][i] = (matrix[j][i] === 0) ? 1 : 0;
  });

  /* Sanity check */
  matrix.forEach((row, i) => {
    (sum(row) % 2 !== 0) && log.push(`!!! В строке ${i + 1} число элементов осталось нечетным, нужно перепроверить изначальную матрицу`);
  });

  return log;
}

function findEulerianCycle(matrix) {
  /* We'll eventually nullify the whole matrix, and trust me,
   * this will be way less headache-inducing if we work with a deep copy from the start. */
  matrix = JSON.parse(JSON.stringify(matrix));

  const result = [];
  const log = [];

  const isGraphTraversed = () => matrix.reduce((a, row) => a + sum(row), 0) === 0;

  const dfsMarkVisited = (row, visited) => {
    const reachable = findIndexes(row, 1);
    reachable.forEach((i) => {
      if (visited.includes(i)) return;
      visited.push(i);

      dfsMarkVisited(matrix[i], visited);
    });
  };

  const connectedComponentCount = () => {
    const visited = [];
    let cc = 0;

    matrix.forEach((row) => { if (sum(row) === 0) cc -= 1 });
    matrix.forEach((row, i) => {
      if (visited.includes(i)) return;
      visited.push(i);

      cc += 1;
      dfsMarkVisited(row, visited);
    });

    return cc;
  };

  const recurse = (i) => {
    result.push(i);
    if (isGraphTraversed()) return;

    const adjacent = findIndexes(matrix[i], 1);

    log.push(`Положим текущей вершину $x_{${i + 1}}$`);

    for (let ii = 0; ii < adjacent.length; ii++) {
      const j = adjacent[ii];

      matrix[i][j] = 0;
      matrix[j][i] = 0;

      const cc = connectedComponentCount();

      if ((matrix.some((row) => sum(row) !== 0) && matrix[j].filter((e) => e === 1).length === 0)
          || (matrix[j].filter((e) => e === 1).length >= 1 && cc > 1)) {
        log.push(`Ребро $x_{${i + 1}\\ ${j + 1}}$ является мостом.`);
        matrix[i][j] = 1;
        matrix[j][i] = 1;
        continue;
      }

      log.push(`Выбираем ребро $x_{${i + 1}\\ ${j + 1}}$.`);
      recurse(j);
      return;
    }
  };

  recurse(0);

  return [result, log];
}
