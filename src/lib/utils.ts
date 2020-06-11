export function compareKeys(a, b) {
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

export function matrix(w, h, value = 0) {
  return Array(w)
    .fill(undefined)
    .map(() => Array(h).fill(value));
}

export function matrixMap(m, func) {
  return m.map((row) => row.map((i) => func(i)));
}
