/** 数字补零 */
export function padIndex(num: number): string {
  if (num < 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

/** 脱敏处理手机号 */
export function maskPhone(phone: string): string {
  if (phone) {
    const matches = /^(\d{3})(\d{4})(\d{4})$/.exec(phone);
    if (matches) {
      return `${matches[1]}****${matches[3]}`;
    }
    return phone;
  }
  return phone;
}

/** 格式化手机号 */
export function formatPhone(phone: string): string {
  if (phone) {
    const matches = /^(\d{3})(\d{4})(\d{4})$/.exec(phone);
    if (matches) {
      return `${matches[1]} ${matches[2]} ${matches[3]}`;
    }
    return phone;
  }
  return phone;
}

interface FormatOptions {
  format?: string; // 格式字符串，例如 'h时m分s秒'
  padZero?: boolean; // 是否补零，如 '01分'，默认 true
  omitZero?: boolean; // 是否省略为 0 的单位，默认 true
}

/**
 * 格式化秒数 hh:mm:ss
 * @param {number} seconds - 总秒数
 * @param {Object} [options]
 * @param {string} [options.format] - 格式模板，如 "h时m分s秒"、"mm:ss"
 * @param {boolean} [options.padZero] - 是否补零（对 hh/mm/ss 生效），默认 true
 * @param {boolean} [options.omitZero] - 是否省略为 0 的单位，默认 true
 * @returns {string}
 */
export function formatSeconds(
  seconds: number,
  options: FormatOptions = {}
): string {
  const { format = "h时m分s秒", padZero = true, omitZero = true } = options;

  const hasHour = /h+/.test(format);
  const hasMinute = /m+/.test(format);
  const hasSecond = /s+/.test(format);

  let h = 0,
    m = 0,
    s = 0;

  // 根据格式决定换算方式
  if (hasHour && hasMinute && hasSecond) {
    h = Math.floor(seconds / 3600);
    m = Math.floor((seconds % 3600) / 60);
    s = seconds % 60;
  } else if (!hasHour && hasMinute && hasSecond) {
    m = Math.floor(seconds / 60);
    s = seconds % 60;
  } else if (!hasHour && !hasMinute && hasSecond) {
    s = seconds;
  } else if (hasHour && !hasMinute && hasSecond) {
    h = Math.floor(seconds / 3600);
    s = seconds % 3600;
  } else if (hasHour && hasMinute && !hasSecond) {
    h = Math.floor(seconds / 3600);
    m = Math.floor((seconds % 3600) / 60);
  } else if (!hasHour && hasMinute && !hasSecond) {
    m = Math.floor(seconds / 60);
  } else if (hasHour && !hasMinute && !hasSecond) {
    h = Math.floor(seconds / 3600);
  }

  const raw = {
    h,
    m,
    s,
    hh: String(h).padStart(2, "0"),
    mm: String(m).padStart(2, "0"),
    ss: String(s).padStart(2, "0"),
  };

  const replacers: { key: keyof typeof raw; value: string | number }[] = [
    { key: "hh", value: padZero ? raw.hh : raw.h },
    { key: "h", value: raw.h },
    { key: "mm", value: padZero ? raw.mm : raw.m },
    { key: "m", value: raw.m },
    { key: "ss", value: padZero ? raw.ss : raw.s },
    { key: "s", value: raw.s },
  ];

  let result = format;

  replacers.forEach(({ key, value }) => {
    const reg = new RegExp(`${key}[^hms]*`, "g");
    result = result.replace(reg, (match) => {
      const isZero = Number(value) === 0;
      return omitZero && isZero ? "" : match.replace(key, String(value));
    });
  });

  return result.trim() || "0秒";
}

/** 格式化日期 */
export function formatDate(
  dateStr: any,
  format = "yyyy-MM-dd HH:mm:ss"
): string {
  const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
  let date: Date;

  // 尝试将输入转换为日期对象
  if (typeof dateStr === "string") {
    // 使用正则表达式匹配结果创建Date对象
    const match = dateStr.match(REGEX_PARSE);
    if (!match) {
      console.error("Invalid date string format");
      // throw new Error("Invalid date string format");
      return dateStr;
    }
    date = new Date(
      parseInt(match[1], 10), // 年份
      parseInt(match[2], 10) - 1 || 0, // 月份（需要减1，因为月份是从0开始的）
      parseInt(match[3], 10) || 1, // 日
      parseInt(match[4], 10) || 0, // 小时
      parseInt(match[5], 10) || 0, // 分钟
      parseInt(match[6], 10) || 0, // 秒
      parseInt(match[7] || "0", 10) // 毫秒
    );
  } else if (dateStr instanceof Date) {
    date = dateStr;
  } else {
    // throw new Error("Invalid date");
    console.error("Invalid date");
    return dateStr;
  }

  const o: { [key: string]: any } = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
    "H+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
    a: date.getHours() < 12 ? "上午" : "下午", // 上午/下午
    A: date.getHours() < 12 ? "AM" : "PM", // AM/PM
  };

  format = format.replace(/(y+)/, (match) =>
    (date.getFullYear() + "").substring(4 - match.length)
  );

  for (let k in o) {
    format = format.replace(new RegExp("(" + k + ")"), (match) =>
      match.length === 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length)
    );
  }
  return format;
}
