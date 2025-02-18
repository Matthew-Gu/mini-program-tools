export default class Helper {
	/** 阻塞进程, 配合 async await 使用 */
	public static sleep(milliseconds: number) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	/** 2个任意精度数字的加法计算 */
	public static add(number1: number, number2: number): number {
		try {
			const decimalPlaces = Math.max(
				number1.toString().split('.')[1]?.length || 0,
				number2.toString().split('.')[1]?.length || 0
			);

			return parseFloat((number1 + number2).toFixed(decimalPlaces));
		} catch (error) {
			console.error('加法操作失败：', error);
			return 0;
		}
	}

	/** 2个任意精度数字的减法 */
	public static sub(number1: number, number2: number): number {
		try {
			const decimalPlaces = Math.max(
				number1.toString().split('.')[1]?.length || 0,
				number2.toString().split('.')[1]?.length || 0
			);

			return parseFloat((number1 - number2).toFixed(decimalPlaces));
		} catch (error) {
			console.error('减法操作失败：', error);
			return 0;
		}
	}

	/** 2个任意精度数字乘法计算 */
	public static mul(number1: number, number2: number): number {
		try {
			const s1 = number1.toString();
			const s2 = number2.toString();
			const decimalPlaces1 = s1.split('.')[1]?.length || 0;
			const decimalPlaces2 = s2.split('.')[1]?.length || 0;
			const totalDecimalPlaces = decimalPlaces1 + decimalPlaces2;

			const num1 = Number(s1.replace('.', ''));
			const num2 = Number(s2.replace('.', ''));

			const result = (num1 * num2) / Math.pow(10, totalDecimalPlaces);
			return result;
		} catch (error) {
			console.error('乘法操作失败：', error);
			return 0;
		}
	}

	/** 2个任意精度的数字除法计算 */
	public static div(number1: number, number2: number): number {
		try {
			if (number2 === 0) {
				console.error('被除数不能为0');
				return 0;
			}
			const s1 = number1.toString();
			const s2 = number2.toString();
			const decimalPlaces1 = s1.split('.')[1]?.length || 0;
			const decimalPlaces2 = s2.split('.')[1]?.length || 0;
			const totalDecimalPlaces = decimalPlaces2 - decimalPlaces1;

			const num1 = Number(s1.replace('.', ''));
			const num2 = Number(s2.replace('.', ''));

			const result = (num1 / num2) * Math.pow(10, totalDecimalPlaces);
			return result;
		} catch (error) {
			console.error('除法操作失败：', error);
			return 0;
		}
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

	/** 格式化日期 yyyy-MM-dd HH:mm:ss */
	public static formatDate(
		dateStr: any,
		format = 'yyyy-MM-dd HH:mm:ss'
	): string {
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

		format = format.replace(/(y+)/, (match) =>
			(date.getFullYear() + '').substring(4 - match.length)
		);

		for (let k in o) {
			format = format.replace(new RegExp('(' + k + ')'), (match) =>
				match.length === 1
					? o[k]
					: ('00' + o[k]).substring(('' + o[k]).length)
			);
		}
		return format;
	}

	/** 格式化秒数 hh:mm:ss 支持短格式 */
	public static formatSeconds(
		seconds: number,
		format: string,
		short = false
	) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		// 格式化小时、分钟、秒
		const hourStr = format.includes('hh')
			? String(hours).padStart(2, '0')
			: String(hours);
		const minuteStr = format.includes('mm')
			? String(minutes).padStart(2, '0')
			: String(minutes);
		const secondStr = format.includes('ss')
			? String(secs).padStart(2, '0')
			: String(secs);

		// 替换映射
		const replacements: { [key: string]: string } = {
			hh: hourStr,
			h: hourStr,
			mm: minuteStr,
			m: minuteStr,
			ss: secondStr,
			s: secondStr
		};

		// 格式化替换函数
		const formatTime = (format: string) => {
			return format.replace(
				/hh|h|mm|m|ss|s/g,
				(match) => replacements[match]
			);
		};

		// 处理短格式
		if (short) {
			if (hours > 0) {
				return formatTime(format);
			} else if (minutes > 0) {
				// 获取从分钟开始的格式
				const index = format.indexOf('m');
				return formatTime(format.slice(index));
			} else if (secs > 0) {
				// 获取从秒开始的格式
				const index = format.indexOf('s');
				return formatTime(format.slice(index));
			}
		}

		// 返回完整格式
		return formatTime(format);
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

	/** 剔除对象中顶层的空值 */
	public static filterEmpty(obj: object): object {
		const result: { [key: string]: any } = {};
		for (const key in obj) {
			if (!obj.hasOwnProperty(key)) continue;
			const value = (obj as any)[key];
			if (value !== null && value !== undefined && value !== '') {
				result[key] = value;
			}
		}
		return result;
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
			.map(
				(key) =>
					`${encodeURIComponent(key)}=${this.qsStringify(obj[key])}`
			)
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
		for (const pair of pairs) {
			// 分割键值对并解码
			const [key, value] = pair.split('=').map(decodeURIComponent);

			// 检查值是否是数组的形式（以逗号分隔）
			if (value.includes(',')) {
				// 将值拆分为数组
				result[key] = value.split(',');
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	/** 防抖函数 */
	public static debounce(
		func: Function,
		wait: number,
		immediate: boolean = false
	): Function {
		let timeout: number | null = null;

		return function (this: any, ...args: any[]) {
			const context = this;

			const later = () => {
				timeout = null;
				if (!immediate) func.apply(context, args); // 防抖：非立即执行时才执行
			};

			const callNow = immediate && !timeout;
			if (timeout !== null) clearTimeout(timeout); // 清除上一个定时器
			timeout = setTimeout(later, wait);

			if (callNow) func.apply(context, args); // 立即执行
		};
	}

	/** 节流函数 */
	public static throttle<T extends any[], R>(
		func: (...args: T) => R,
		wait: number
	): (...args: T) => void {
		let inThrottle: boolean;
		return function (this: any, ...args: T): void {
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), wait);
			}
		};
	}

	/** 根据给定的keys从对象中选择属性 */
	public static pick(
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
	public static omit(
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

	/** 设置可以回调的地址 */
	public static setCallbackUrl(
		mode?: 'redirectTo' | 'switchTab' | 'reLaunch' | 'navigateTo'
	) {
		return new Promise((resolve) => {
			let pages = getCurrentPages(); //获取加载的页面
			let currentPage = pages[pages.length - 1]; //获取当前页面的对象
			let urlPage = ''; // 存储的跳转地址
			let url = currentPage.route; //当前页面url
			let argumentsStr = '';
			let options = currentPage.options; //如果要获取url中所带的参数可以查看options
			for (let key in options) {
				let value = options[key];
				argumentsStr += key + '=' + value + '&';
			}
			if (argumentsStr) {
				argumentsStr = argumentsStr.substring(
					0,
					argumentsStr.length - 1
				);
				urlPage = url + '?' + argumentsStr;
			} else {
				urlPage = url;
			}
			let callbackObj = {
				callbackUrl: `/${urlPage}`,
				mode: mode || 'redirectTo'
			};
			wx.setStorageSync('callbackObj', JSON.stringify(callbackObj));
			resolve({});
		});
	}

	/** 获取可以回调的地址并进行跳转 */
	public static getCallbackUrl() {
		return new Promise((_resolve, reject) => {
			const callbackObj = wx.getStorageSync('callbackObj');
			if (callbackObj) {
				let resultObj = JSON.parse(callbackObj);
				let callbackUrl = resultObj.callbackUrl;
				let mode = resultObj.mode;
				const modeActions: Record<string, Function> = {
					redirectTo: (cb: any) =>
						wx.redirectTo({ url: callbackUrl, success: cb }),
					switchTab: (cb: any) =>
						wx.switchTab({ url: callbackUrl, success: cb }),
					reLaunch: (cb: any) =>
						wx.reLaunch({ url: callbackUrl, success: cb }),
					navigateTo: (cb: any) =>
						wx.navigateTo({ url: callbackUrl, success: cb })
				};

				const action = modeActions[mode];
				action &&
					action(() => {
						// 跳转成功清除回调地址
						wx.removeStorageSync('callbackObj');
					});
			} else {
				reject();
			}
		});
	}
}
