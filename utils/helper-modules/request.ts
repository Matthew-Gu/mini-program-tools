/** 模拟请求 */
export function mockApi(data: any) {
  const delay = Math.random() * 1000 + 500;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: data,
        error: false,
        msg: "操作成功",
        success: true,
      });
    }, delay);
  });
}

/** 将 Promise 转换为 [err, data] 元组形式，避免 try/catch */
export function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt);
        return [parsedError, undefined];
      }

      return [err, undefined];
    });
}
