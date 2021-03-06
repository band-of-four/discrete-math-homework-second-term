import { h } from 'preact';
import { rlog, rmatrix, rmatrixHeadered } from './r.js';
import { DeepComparisonSet, lastEl, findIndexes, findIndexOrInsert,
         setWithEl, allTrue, or, zip,
         mutRemoveEl, mutAssign2d } from './enumerable.js';

export default function(matrix) {
  const [ hamiltonianCycle, rfLog ] = robertsFlores(matrix);
  const [ reorderedMatrix, reorderedVertices ] = reorderVertices(matrix, hamiltonianCycle);
  const [ intersections, edges, isLog ] = intersectionMatrix(reorderedMatrix);
  const [ psiSet, psiLog ] = independentVertexSets(intersections, edges);

  const [ anlMatrix, anlLog ] = analyzePsiSet(psiSet);

  const edgeNames = edges.map(([i, j]) => `$p_{${i}\\ ${j}}$`);

  return (
    <div>
      <h2>Нахождение гамильтонова цикла</h2>
      {rlog(rfLog)}
      <h2>Матрица смежности с перенумерованными вершинами</h2>
      {rmatrix(reorderedMatrix)}
      <table>
        <tr>
          <th>до перенумерации</th>
          {reorderedVertices.map(([before, _]) => (<td>{`$x_{${before + 1}}$`}</td>))}
        </tr>
        <tr>
          <th>после перенумерации</th>
          {reorderedVertices.map(([_, after]) => (<td>{`$x_{${after + 1}}$`}</td>))}
        </tr>
      </table>
      <h2>Построение графа пересечений $G'$</h2>
      {rlog(isLog)}
      {rmatrixHeadered(intersections, edgeNames)}
      <h2>Построение семейства $\psi_G$</h2>
      {rlog(psiLog)}
      <h2>Выделение из $G'$ максимального двудольного подграфа $H'$</h2>
      {rlog(anlLog)}
      {rmatrix(anlMatrix)}
    </div>
  );
}

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
  
  const [ pathSet, _ ] = robertsFloresStep(matrix, adjacent, 0, 0, new Set([0]), new DeepComparisonSet(), log);
  return [Array.from(pathSet), log];
}

function robertsFloresStep(matrix, adjacent, vPrev, v, path, pathsTaken, log) {
  const vertices = matrix.length;
  const pathStr = () => `$S = \\{${Array.from(path).map((n) => `x_{${n + 1}}`)}\\}$`;

  pathsTaken.add(path);

  if (path.size === vertices) {
    if (matrix[0][v] === 1) {
      log.push(`Гамильтонов цикл найден. ${pathStr()}`);
      return [path, log];
    }
    path.delete(v);
    const vNext = lastEl(path);
    log.push(`Ребра $(x_${v + 1},x_1)$ нет, найдена гамильтонова цепь. ` +
      `Прибегнем к возвращению: удалим из $S$ вершину $x_{${v + 1}}$, перейдем к $x_{${vNext + 1}}$. ${pathStr()}`);
    return robertsFloresStep(matrix, adjacent, v, vNext, path, pathsTaken, log);
  }

  for (let i = 0; i < adjacent[v].length; i++) {
    const vAdj = adjacent[v][i];
    if (vAdj !== vPrev && !path.has(vAdj) && !pathsTaken.has(setWithEl(path, vAdj))) {
      path.add(vAdj);
      log.push(`Возможная вершина: $x_{${vAdj + 1}}$. ${pathStr()}`);
      return robertsFloresStep(matrix, adjacent, v, vAdj, path, pathsTaken, log);
    }
  }

  path.delete(v);
  const vNext = lastEl(path);
  log.push(`У $x_{${v + 1}}$ больше нет возможных вершин, удалим ее. Перейдем к $x_{${vNext + 1}}$. ${pathStr()}`);
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

  return [newMatrix, Array.from(renamedVertices)];
}

function intersectionMatrix(matrix) {
  const matrixCutoff = 15; /* limits the number of intersections to 15 */
  const log = [];
  const mrows = [];
  const m = [];

  matrix.forEach((row, i) => {
    /* i + 2 because we need to skip the lower left triangle and the cycle */
    const adjacent = findIndexes(row, 1).filter((j) => j >= i + 2).reverse();

    adjacent.forEach((j) => {
      const edges = [];  

      if (mrows.length === matrixCutoff) return;

      matrix.slice(0, i).forEach((intersectRow, i1) => {
        const adjacentIntersecting = findIndexes(intersectRow, 1).filter((j1) => j1 >= i + 1 && j1 < j);

        adjacentIntersecting.forEach((j1) => {
          edges.push([i1, j1]);

          const i1j1Index = findIndexOrInsert(mrows, ([ri, rj]) => ri === i1 && rj === j1, [i1, j1]);
          const ijIndex = findIndexOrInsert(mrows, ([ri, rj]) => ri === i && rj === j, [i, j]);
  
          mutAssign2d(m, i1j1Index, ijIndex, 1);
          mutAssign2d(m, ijIndex, i1j1Index, 1);
        });
      });

      if (edges.length > 0 && edges.length < matrixCutoff) {
        log.push(`Определим $p_{${i + 1}${j + 1}}$, для чего в матрице $R$ выделим подматрицу $R_{${i + 1}${j + 1}}$.`);
        log.push(`Ребро $(x_{${i + 1}}x_{${j + 1}})$ пересекается с $${edges.map(([i1, j1]) => `(x_{${i1 + 1}}x_{${j1 + 1}})`).join(",")}$`);
      }
      if (mrows.length === matrixCutoff)
        log.push(`${matrixCutoff} пересечений графа найдено, закончим поиск.`);
    });
  });
  
  /* At this point, we may end up with a matrix that has > than matrixCutoff columns,
   * so we rebuild it. */
  const result = [];

  for (let i = 0; i < Math.min(m.length, matrixCutoff); i++) {
    result[i] = [];
    for (let j = 0; j < Math.min(m.length, matrixCutoff); j++) {
      if (i === j) result[i][j] = 1;
      else if (typeof m[i][j] === 'undefined') result[i][j] = 0;
      else result[i][j] = m[i][j];
    }
  }

  return [result, mrows.slice(0, matrixCutoff).map(([i, j]) => [i + 1, j + 1]), log];
}

function independentVertexSets(matrix, edges) {
  const log = [];
  const result = [];

  /* We don't have to iterate all rows: when constructing M_{ij} disjunctions,
   * since i > j, there may be rows where no possible combination of disjunctions
   * can be truthy. */
  let iMax = 0;
  let falseyIndex = 0;
  for (let i = 0; i < matrix.length; i++) {
    const rowDisj = matrix.slice(i, matrix.length).reduce((disj, r) => or(disj, r), Array(matrix.length).fill());
    if (allTrue(rowDisj))
      iMax = i;
    else {
      falseyIndex = rowDisj.findIndex((e) => e === 0);
      break;
    }
  }

  matrix.forEach((row, i) => {
    if (i > iMax) return;

    const js = row.reduce((a, el, j) => (el == 0 && j > i) ? a.concat(j) : a, []);

    if (js.length === 0) {
      log.push(`$\\psi_${result.length + 1} = \\{${i + 1}\\}$`);
      result.push([i]);
    }
    else {
      log.push(`В ${i + 1} строке ищем первый нулевой элемент - $r_{${i + 1}\\ ${js[0] + 1}}$.`);
      recurseJPrimes(matrix, edges, js, i, matrix[i], [i], result, log);
      log.push('');
    }
  });

  if (iMax < matrix.length - 1) {
    log.push(`Из матрицы $R(G')$ видно, что строки с номерами j > ${iMax + 1} не смогут закрыть ноль в позиции ${falseyIndex + 1}.\n`);
  }

  log.push(`Семейство максимальных внутренне устойчивых множеств $\\psi_G$ построено. Это:`);
  result.forEach((psi, psiIndex) => {
    log.push(`$\\psi_{${psiIndex + 1}} = \\{${psi.map((i) => `u_{${edges[i].join("\\ ")}}`)}\\}$`);
  });

  return [result, log];
}

function recurseJPrimes(matrix, edges, jPrimes, j, disj, psi, result, log) {
  const disp = (vals) => vals.map((v) => v + 1).join("\\ ");
  const commaDisp = (vals) => vals.map((v) => v + 1).join(", ");
  const psiDisp = (psi) => psi.map((i) => `u_{${edges[i].join("\\ ")}}`).join(",");

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

      /* Quick test to see if it's reasonable to follow the path of the new J' --
       * make a disjunction of all remaining rows and see if it reaches all 1s,
       * otherwise back off. */
      const finalZeroes = findIndexes(newJPrimes.reduce((d, k) => or(d, matrix[k]), newDisj), 0);

      if (allTrue(newDisj)) {
        result.push(Array.from(psi));
        log.push(`В строке $M_{${disp(psi)}}$ все 1. Построено $\\psi_{${result.length}} = \\{${psiDisp(psi)}\\}$`);
      }
      else if (newJPrimes.length > 0) {
        log.push(`В строке $M_{${disp(psi)}}$ находим номера нулевых элементов, составляем список $J' = \\{${commaDisp(newJPrimes)}\\}$.`);
        if (finalZeroes.length === 0) recurseJPrimes(matrix, edges, newJPrimes, k, newDisj, psi, result, log);
        else log.push(`Строк${newJPrimes.length === 1 ? 'а' : 'и'} ${commaDisp(newJPrimes)} не закро${newJPrimes.length === 1 ? 'ет' : 'ют'} ` +
          ((finalZeroes.length === 1)
           ? `ноль на ${finalZeroes[0] + 1} позиции.`
           : `нули на позициях ${commaDisp(finalZeroes)}`));
      }
      else log.push(`В строке $M_{${disp(psi)}}$ остались незакрытые 0.`);

      mutRemoveEl(psi, k);
    }
  });
}

function analyzePsiSet(psiSet) {
  const m = [];
  const log = [];

  log.push(`Для каждой пары множеств вычислим значение критерия ` +
    `$\\alpha_{\\gamma\\beta} = |\\psi_\\gamma| + |\\psi_\\beta| - |\\psi_\\gamma \\cap \\psi_\\beta|$:`);

  psiSet.forEach((psiG, i) => {
    psiSet.forEach((psiB, j) => {
      if (j < i + 1) return;

      const intersection = psiG.filter((v) => psiB.includes(v));
      const alpha = psiG.length + psiB.length - intersection.length;

      mutAssign2d(m, i, j, alpha);

      log.push(`$\\alpha_{${i + 1}${j + 1}} = |\\psi_{${i + 1}}| + |\\psi_{${j + 1}}| - |\\psi_{${i + 1}} \\cap \\psi_{${j + 1}}| = ` +
        `${psiG.length} + ${psiB.length} - ${intersection.length} = ${alpha}$`);
    });
  });

  for (let i = 0; i < m.length; i++)
    for (let j = 0; j < m.length; j++)
      if (typeof m[i][j] === 'undefined') m[i][j] = '-';

  return [m, log];
}
