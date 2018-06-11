import { h } from 'preact';

export default function(matrix) {
  const [ hamiltonianCycle, rfLog ] = robertsFlores(matrix);
  const reorderedMatrix = reorderVertices(matrix, hamiltonianCycle);
  const psiLog = psiSet(reorderedMatrix);

  return (
    <div>
      <h2>Нахождение гамильтонова цикла</h2>
      <p class="multiline">{rfLog.join('\n')}</p>
      <h2>Матрица смежности с перенумерованными вершинами</h2>
      <table>
        {reorderedMatrix.map((row, rowi) => (<tr>{
          row.map((cell, coli) => (<td>{coli > rowi ? (<strong><u>{cell}</u></strong>) : cell}</td>))
        }</tr>))}
      </table>
      <h2>Построение графа пересечений $G'$</h2>
      <h2>Построение семейства $\psi_G$</h2>
      <p class="multiline">{psiLog.join('\n')}</p>
    </div>
  );
}

class DeepSet {
  constructor() { this.set = new Set(); }

  add(set) { this.set.add(JSON.stringify(Array.from(set))); }

  has(set) { return this.set.has(JSON.stringify(Array.from(set))); }
}

function lastInSet(set) { return Array.from(set).pop(); }

function findIndexes(array, val) { return array.reduce((a, el, i) => (el == val) ? a.concat(i) : a, []); }

function setWith(set, el) { return new Set(set).add(el) }

// https://stackoverflow.com/a/14986106/1726690
function splitOverlapping(array, chunkSize) {
  const res = [];
  for (let i = 0; i < array.length - (chunkSize - 1); i++) {
    res.push(array.slice(i, i + chunkSize));
  }
  return res;
}

function robertsFlores(matrix) {
  const vertices = matrix.length;
  const log = [];

  const adjacent = Array(vertices).fill().map((_, i) => findIndexes(matrix[i], 1));
  log.push(`Включаем в $S$ вершину $x_1$. $S = \\{x_1\\}$`);
  
  const [ pathSet, _ ] = robertsFloresStep(matrix, adjacent, 0, 0, new Set([0]), new DeepSet(), log);
  return [Array.from(pathSet), log];
}

function robertsFloresStep(matrix, adjacent, vPrev, v, path, pathsTaken, log) {
  const vertices = matrix.length;
  const pathStr = () => `$S = \\{${Array.from(path).map((n) => `x_${n + 1}`)}\\}$`;

  pathsTaken.add(path);

  if (path.size === vertices) {
    if (matrix[0][v] === 1) {
      log.push(`Гамильтонов цикл найден. ${pathStr()}`);
      return [path, log];
    }
    path.delete(v);
    const vNext = lastInSet(path);
    log.push(`Ребра $(x_${v + 1},x_1)$ нет, найдена гамильтонова цепь. ` +
      `Прибегнем к возвращению: удалим из $S$ вершину $x_${v + 1}$, перейдем к $x_${vNext + 1}$. ${pathStr()}`);
    return robertsFloresStep(matrix, adjacent, v, vNext, path, pathsTaken, log);
  }

  for (let i = 0; i < adjacent[v].length; i++) {
    const vAdj = adjacent[v][i];
    if (vAdj !== vPrev && !path.has(vAdj) && !pathsTaken.has(setWith(path, vAdj))) {
      path.add(vAdj);
      log.push(`Возможная вершина: $x_${vAdj + 1}$. ${pathStr()}`);
      return robertsFloresStep(matrix, adjacent, v, vAdj, path, pathsTaken, log);
    }
  }

  path.delete(v);
  const vNext = lastInSet(path);
  log.push(`У ${v + 1} больше нет возможных вершин, удалим ее. Перейдем к ${vNext + 1}. ${pathStr()}`);
  return robertsFloresStep(matrix, adjacent, v, vNext, path, pathsTaken, log);
}

function reorderVertices(matrix, hamiltonianCycle) {
  const cycleEdges = splitOverlapping(hamiltonianCycle, 2);
  const renamedVertices = new Map(hamiltonianCycle.map((v, i) => [i, v]));

  const newMatrix = [];
  for (let a = 0; a < matrix.length; a++) {
    newMatrix[a] = []
    for (let b = 0; b < matrix.length; b++) {
      newMatrix[a][b] = matrix[renamedVertices.get(a)][renamedVertices.get(b)];
    }
  }

  return newMatrix;
}

function psiSet(matrix) {
  matrix = [
      [1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 1],
      [0, 0, 1, 0, 0, 1, 1, 0],
      [0, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1]
  ];
  const log = [];
  const result = [];
  matrix.forEach((row, i) => {
    const js = row.reduce((a, el, j) => (el == 0 && j > i) ? a.concat(j) : a, []);

    if (i === matrix.length - 1) {
      log.push(`Семейство максимальных внутренне устойчивых множеств $\\psi_G$ построено. Это:`);
      result.forEach((phi, phiIndex) => {
        log.push(`$\\psi_{${phiIndex + 1}} = \\{${phi.map((i) => i + 1).join(",")}\\}$`);
      });
    }
    else if (js.length === 0) {
      log.push(`$\\psi_${result.length + 1} = \\{${i + 1}\\}$`);
      result.push([i]);
    }
    else recurseJPrimes(matrix, js, i, matrix[i], [i], result, log);
  });

  console.log(result);
  return log;
}

function recurseJPrimes(matrix, jPrimes, j, disj, psi, result, log) {
  const disp = (vals) => vals.map((v) => v + 1).join("");
  const commaDisp = (vals) => vals.map((v) => v + 1).join(",");
  if (allTrue(disj)) {
    result.push(Array.from(psi));
    log.push(`Построено $\\psi_{${result.length}} = \\{${commaDisp(psi)}\\}$\n`);
    return;
  }

  jPrimes.forEach((k) => {
    if (k > j) {
      const row = matrix[k];
      psi.push(k);
      log.push(
        `Записываем дизъюнкцию $M_{${disp(psi)}} = ` + 
        ((psi.length - 1  === 1) ? `r_{${psi[0] + 1}}` : `M_{${disp(psi.slice(0, psi.length - 1))}}`) +
        `\\lor r_{${k + 1}} = ${disj.join("")} \\lor ${row.join("")} = ${or(disj, row).join("")}$`);
      const newDisj = or(disj, row);
      const newJPrimes = newDisj.reduce((a, el, j) => (el == 0 && j >= k) ? a.concat(j) : a, []);
      log.push(`В строке $M_{${disp(psi)}}$ ` +
        ((newJPrimes.length > 1)
        ? `находим номера нулевых элементов, составляем список $J' = \\{${commaDisp(newJPrimes)}\\}$.`
        : (newJPrimes.length === 1)
          ? `находим $m_{${newJPrimes[0] + 1}} = 0$.`
          : allTrue(newDisj) 
            ? `все 1.`
          : `остались незакрытые 0.`));
      recurseJPrimes(matrix, newJPrimes, k, newDisj, psi, result, log);
      remove(psi, k);
    }
  });
}

function allTrue(bitarray) { return bitarray.every((e) => e === 1); }

function or(as, bs) { return zip(as, bs).map(([a, b]) => a | b); }

function zip(as, bs) { return as.map((a, i) => [a, bs[i]]); }

function remove(array, el) {
  const index = array.indexOf(el);
  (index !== -1) && array.splice(index, 1);
}
