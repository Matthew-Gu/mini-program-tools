export default class Helper {
    /** 2个任意精度数字的加法计算 */
    public static add(left_operand: number, right_operand: number): number {
        let r1, r2, max;
        try {
            r1 = left_operand.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }

        try {
            r2 = right_operand.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }

        max = Math.pow(10, Math.max(r1, r2));
        return (left_operand * max + right_operand * max) / max;
    }

    /** 2个任意精度数字的减法 */
    public static sub(left_operand: number, right_operand: number): number {
        let r1, r2, max, min;
        try {
            r1 = left_operand.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }

        try {
            r2 = right_operand.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }

        max = Math.pow(10, Math.max(r1, r2));
        min = r1 >= r2 ? r1 : r2;
        return parseFloat(((left_operand * max - right_operand * max) / max).toFixed(min));
    }

    /** 2个任意精度数字乘法计算 */
    public static mul(left_operand: number, right_operand: number): number {
        let max = 0,
            s1 = left_operand.toString(),
            s2 = right_operand.toString();
        try {
            max += s1.split('.')[1].length;
        } catch (e) {}

        try {
            max += s2.split('.')[1].length;
        } catch (e) {}

        return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, max);
    }

    /** 2个任意精度的数字除法计算 */
    public static div(left_operand: number, right_operand: number): number {
        let t1 = 0,
            t2 = 0,
            r1,
            r2;
        try {
            t1 = left_operand.toString().split('.')[1].length;
        } catch (e) {}

        try {
            t2 = right_operand.toString().split('.')[1].length;
        } catch (e) {}

        r1 = Number(left_operand.toString().replace('.', ''));
        r2 = Number(right_operand.toString().replace('.', ''));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }

    /** 将数组打乱 */
    public static shuffle(value: Array<any>): Array<any> {
        let length = value.length;
        for (let i = length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [value[i], value[j]] = [value[j], value[i]];
        }

        return value;
    }

    /** 返回指定范围的随机整数 */
    public static intRand(min: number, max: number): number {
        let value: number = Math.random() * (max - min + 1) + min;
        return parseInt(value.toString(), 10);
    }

    /** 返回指定日期时间戳 */
    public static strtotime(time: string): number {
        return Math.round(new Date(time).getTime() / 1000);
    }

    /** 返回当前时间戳 */
    public static time(): number {
        return Math.round(new Date().getTime() / 1000);
    }

    /** 生成有道词典英语音频 */
    public static getAudioUrl(english: string) {
        return `http://dict.youdao.com/dictvoice?type=0&audio=${english}`;
    }

    /** 格式化日期 */
    public static date(dateStr: any, format = 'yyyy-MM-dd HH:mm:ss'): string {
        const REGEX_PARSE =
            /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
        let date: Date;

        // 尝试将输入转换为日期对象
        if (typeof dateStr === 'string') {
            // 使用正则表达式匹配结果创建Date对象
            const match = dateStr.match(REGEX_PARSE);
            if (!match) {
                throw new Error('Invalid date string format');
            }
            date = new Date(
                parseInt(match[1], 10), // 年份
                parseInt(match[2], 10) - 1 || 0, // 月份（需要减1，因为月份是从0开始的）
                parseInt(match[3], 10) || 1, // 日
                parseInt(match[4], 10) || 0, // 小时
                parseInt(match[5], 10) || 0, // 分钟
                parseInt(match[6], 10) || 0, // 秒
                parseInt(match[7] || '0', 10) // 毫秒
            );
        } else if (dateStr instanceof Date) {
            date = dateStr;
        } else {
            throw new Error('Invalid date');
        }

        const o: { [key: string]: any } = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
            'H+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            S: date.getMilliseconds(), // 毫秒
            a: date.getHours() < 12 ? '上午' : '下午', // 上午/下午
            A: date.getHours() < 12 ? 'AM' : 'PM' // AM/PM
        };

        format = format.replace(/(y+)/, (match) => (date.getFullYear() + '').substring(4 - match.length));

        for (let k in o) {
            format = format.replace(new RegExp('(' + k + ')'), (match) =>
                match.length === 1 ? o[k] : ('00' + o[k]).substring(('' + o[k]).length)
            );
        }
        return format;
    }

    /** 复制一个对象或数组，支持深拷贝和浅拷贝 */
    public static clone(obj: object, isDeep = false, map = new WeakMap()) {
        if (typeof obj !== 'object' || obj === null) {
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
                    result[i] = this.clone(obj[i], true, map); // 递归深拷贝
                }
            } else {
                result = {};
                map.set(obj, result); // 防止循环引用
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key] = this.clone((obj as any)[key], true, map); // 递归深拷贝
                    }
                }
            }
            return result;
        } else {
            // 浅拷贝
            return Array.isArray(obj) ? [...obj] : { ...obj };
        }
    }

    /** 参数字符串化 */
    public static qsStringify(obj: object): string {
        // 检查是否为对象类型
        if (typeof obj !== 'object' || obj === null) {
            // 如果是非对象类型，直接返回其字符串形式
            if (typeof obj === 'string') {
                return encodeURIComponent(obj);
            } else {
                return String(obj);
            }
        }

        // 如果是数组类型
        if (Array.isArray(obj)) {
            return obj.map((item) => this.qsStringify(item)).join(',');
        }

        // 如果是普通对象类型
        return Object.keys(obj)
            .map((key) => `${encodeURIComponent(key)}=${this.qsStringify(obj[key])}`)
            .join('&');
    }

    /** 解析字符串参数 */
    public static qsParse(queryString: string): object {
        // 检查是否为字符串类型
        if (typeof queryString !== 'string') {
            throw new Error('Input must be a string');
        }

        // 创建空对象用于存储解析后的键值对
        const result = {};

        // 将查询字符串分割成键值对数组
        const pairs = queryString.split('&');

        // 遍历键值对数组，解析成对象的属性和值
        pairs.forEach((pair) => {
            // 分割键值对
            const [key, value] = pair.split('=');

            // 对键和值进行解码
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value);

            // 检查值是否是数组的形式（以逗号分隔）
            if (decodedValue.includes(',')) {
                // 将值拆分为数组
                result[decodedKey] = decodedValue.split(',');
            } else {
                result[decodedKey] = decodedValue;
            }
        });

        return result;
    }
}
