/** 计算小数位数 */
const getDecimalLength = (num: number): number =>
  num.toString().split(".")[1]?.length || 0;

/** 精确加法 */
export function add(a: number, b: number): number {
  const maxPrecision = Math.pow(
    10,
    Math.max(getDecimalLength(a), getDecimalLength(b))
  );
  return (a * maxPrecision + b * maxPrecision) / maxPrecision;
}

/** 精确减法 */
export function sub(a: number, b: number): number {
  const maxPrecision = Math.pow(
    10,
    Math.max(getDecimalLength(a), getDecimalLength(b))
  );
  return parseFloat(
    ((a * maxPrecision - b * maxPrecision) / maxPrecision).toFixed(
      getDecimalLength(a) || getDecimalLength(b)
    )
  );
}

/** 精确乘法 */
export function mul(a: number, b: number): number {
  const decimalCount = getDecimalLength(a) + getDecimalLength(b);
  return (
    (Number(a.toString().replace(".", "")) *
      Number(b.toString().replace(".", ""))) /
    Math.pow(10, decimalCount)
  );
}

/** 精确除法 */
export function div(a: number, b: number): number {
  const diffPrecision = getDecimalLength(b) - getDecimalLength(a);
  return (
    (Number(a.toString().replace(".", "")) /
      Number(b.toString().replace(".", ""))) *
    Math.pow(10, diffPrecision)
  );
}

/** 返回指定范围的随机整数 */
export function intRand(min: number, max: number): number {
  let value: number = Math.random() * (max - min + 1) + min;
  return parseInt(value.toString(), 10);
}
