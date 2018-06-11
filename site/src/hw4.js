import { h } from 'preact';

export default function(matrix) {
  const [ hamiltonianCycle, rfLog ] = robertsFlores(matrix);
  return (
    <div>
      <h2>Нахождение гамильтонова цикла</h2>
      <p class="multiline">{rfLog.join('\n')}</p>
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

function robertsFlores(matrix) {
  const vertices = matrix.length;
  const log = [];

  const adjacent = Array(vertices).fill().map((_, i) => findIndexes(matrix[i], 1));
  log.push(`Включаем в $S$ вершину $x_1$. $S = \\{x_1\\}$`);
  
  return robertsFloresStep(matrix, adjacent, 0, 0, new Set([0]), new DeepSet(), log);
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
