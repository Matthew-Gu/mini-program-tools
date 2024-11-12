export default class Helper {
    /** 将数组打乱 */
    public static shuffle(value: Array<any>): Array<any> {
        let length = value.length;
        for (let i = length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [value[i], value[j]] = [value[j], value[i]];
        }

        return value;
    }

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

    /** 格式化时间 */
    public static formatSeconds(seconds: number, format = 'HH:mm:ss'): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours === 0) {
            format = format.replace(/HH[^a-zA-Z0-9]*|H[^a-zA-Z0-9]*/, '');
        }

        const formatTokens: Record<string, string> = {
            HH: hours.toString().padStart(2, '0'),
            H: hours.toString(),
            mm: minutes.toString().padStart(2, '0'),
            m: minutes.toString(),
            ss: secs.toString().padStart(2, '0'),
            s: secs.toString()
        };

        return format.replace(/HH|H|mm|m|ss|s/g, (match) => formatTokens[match]);
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
    public static getDateTime(): number {
        return new Date().getTime();
    }
    public static secondChange(t: number): any {
        if (t > 60) {
            return Math.floor(t / 60) + '分' + Math.floor(t % 60) + '秒';
        }
        return Math.floor(t) + '秒';
    }
    public static secondsToTime(seconds: number, format: 'hh:mm:ss' | 'mm:ss' | 'ss' = 'hh:mm:ss'): string {
        if (seconds < 0) {
            throw new Error('Seconds cannot be negative.');
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsStr = Math.floor(seconds % 60);

        const pad = (num: number) => num.toString().padStart(2, '0');

        switch (format) {
            case 'hh:mm:ss':
                return `${pad(hours)}:${pad(minutes)}:${pad(secondsStr)}`;
            case 'mm:ss':
                return `${pad(minutes)}:${pad(secondsStr)}`;
            case 'ss':
                return `${pad(secondsStr)}`;
            default:
                throw new Error('Invalid format. Use "hh:mm:ss", "mm:ss", or "ss".');
        }
    }
    /** 有回调的迭代器 */
    public static each(object: any, callback: Function): void {
        if (Array.isArray(object)) {
            object.every((value, index) => {
                return callback.call(value, index, value) !== false;
            });
        } else if (typeof object === 'object' && object !== null) {
            for (const key in object) {
                if (object.hasOwnProperty(key) && callback.call(object[key], key, object[key]) === false) {
                    return;
                }
            }
        }
    }

    /** 复制一个对象或数组，支持深拷贝和浅拷贝 */
    public static copy(obj: object, isDeep = false, map = new WeakMap()) {
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
                    result[i] = this.copy(obj[i], true, map); // 递归深拷贝
                }
            } else {
                result = {};
                map.set(obj, result); // 防止循环引用
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key] = this.copy((obj as any)[key], true, map); // 递归深拷贝
                    }
                }
            }
            return result;
        } else {
            // 浅拷贝
            return Array.isArray(obj) ? [...obj] : { ...obj };
        }
    }
}
