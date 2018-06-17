/* Array & matrix traversal helpers */

/* Allows deep comparison of arbitrary objects (arrays) by
 * converting them to JSON strings on insertion. */
export class DeepComparisonSet {
  constructor() { this.set = new Set(); }

  add(set) { this.set.add(JSON.stringify(Array.from(set))); }

  has(set) { return this.set.has(JSON.stringify(Array.from(set))); }
}

export function lastEl(enumerable) { return Array.from(enumerable).pop(); }

export function findIndexes(array, v) { return findIndexesBy(array, (el) => el === v); }

export function findIndexesBy(array, pred) { return array.reduce((a, el, i) => pred(el) ? a.concat(i) : a, []); }

export function findIndexOrInsert(array, pred, val) {
  const index = array.findIndex(pred);
  if (index !== -1) return index;
  array.push(val); return array.length - 1;
}

/* https://stackoverflow.com/a/24782004/1726690 */
export function chunks(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize)
    result.push(array.slice(i, i + chunkSize));
  return result;
}

export function setWithEl(set, el) { return new Set(set).add(el) }

export function allTrue(bits) { return bits.every((e) => e === 1); }

export function or(as, bs) { return zip(as, bs).map(([a, b]) => a | b); }

export function zip(as, bs) { return as.map((a, i) => [a, bs[i]]); }

export function sum(array) { return array.reduce((a, b) => a + b, 0); }

export function mutRemoveEl(array, el) {
  const index = array.indexOf(el);
  (index !== -1) && mutRemoveIndex(array, index);
}

export function mutRemoveIndex(array, index) { array.splice(index, 1); }

export function mutAssign2d(matrix, i, j, val) {
  if (typeof matrix[i] === 'undefined') matrix[i] = [];
  matrix[i][j] = val;
}
