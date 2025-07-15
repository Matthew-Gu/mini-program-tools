/** 将数组打乱 */
export function shuffle<T>(value: T[]): T[] {
  let length = value.length;
  for (let i = length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [value[i], value[j]] = [value[j], value[i]];
  }

  return value;
}

/** 返回数组中随机一项 */
export function getRandomItem<T>(array: T[]): T {
  const randomIdx = Math.floor(Math.random() * array.length);
  return array[randomIdx];
}

/** 重复数组 n 次 */
export function repeatArray<T>(arr: T[], n: number): T[] {
  if (!Array.isArray(arr) || n <= 0) {
    return [];
  }

  if (n === 1) {
    return arr;
  }

  return Array.from({ length: n }, () => arr).flat();
}
