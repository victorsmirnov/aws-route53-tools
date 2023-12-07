// We do not have these functions in Node.js. So, I do a simple implementation.
// I guess that it is inefficient. But we use it for a small number of small sets, so who cares.

export function difference<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set<T>([...setA].filter((value) => !setB.has(value)))
}

export function symmetricDifference<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set<T>([...difference(setA, setB), ...difference(setB, setA)])
}

export function printSet<T> (set: Set<T>): string {
  return set.size === 0
    ? '[empty]'
    : [...set].sort((a, b) => String(a).localeCompare(String(b))).join(', ')
}
