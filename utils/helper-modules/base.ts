/** 模拟休眠 需配合async await */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** 复制一个对象或数组，支持深拷贝和浅拷贝 */
export function clone(obj: object, isDeep = false, map = new WeakMap()) {
  if (typeof obj !== "object" || obj === null) {
    return obj; // 如果不是对象，直接返回原始值
  }

  if (isDeep) {
    if (map.has(obj)) {
      return map.get(obj); // 处理循环引用
    }

    let result: any;
    if (Array.isArray(obj)) {
      result = [];
      map.set(obj, result); // 防止循环引用
      for (let i = 0; i < obj.length; i++) {
        result[i] = clone(obj[i], true, map); // 递归深拷贝
      }
    } else {
      result = {};
      map.set(obj, result); // 防止循环引用
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = clone((obj as any)[key], true, map); // 递归深拷贝
        }
      }
    }
    return result;
  } else {
    // 浅拷贝
    return Array.isArray(obj) ? [...obj] : { ...obj };
  }
}

/** 剔除对象中顶层的空值 */
export function filterEmpty(obj: object): object {
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = (obj as any)[key];
    if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

/** 根据给定的keys从对象中选择属性 */
export function pick(
  object: { [key: string]: any },
  keys: string | string[]
): { [key: string]: any } {
  const result: { [key: string]: any } = {};
  const props = Array.isArray(keys) ? keys : [keys];

  for (let i = 0; i < props.length; i++) {
    const key = props[i];
    if (key in object) {
      result[key] = object[key];
    }
  }

  return result;
}

/** 从对象中移除指定的keys */
export function omit(
  object: { [key: string]: any },
  keys: string | string[]
): { [key: string]: any } {
  const result: { [key: string]: any } = {};
  const props = Array.isArray(keys) ? keys : [keys];

  for (const key in object) {
    if (object.hasOwnProperty(key) && !props.includes(key)) {
      result[key] = object[key];
    }
  }

  return result;
}
