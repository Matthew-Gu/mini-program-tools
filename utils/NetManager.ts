import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

type Methods = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';

// 请求响应参数（不包含data）
interface Result {
	code: number;
	msg: string;
}

// 请求响应参数（包含data）
interface ResultData<T = any> extends Result {
	data?: T;
	rows?: T;
}

/** 处理HTTP响应状态码 */
function handleStatusCode(statusCode: number, data: any) {
	switch (true) {
		case statusCode >= 200 && statusCode < 300:
			// 成功请求
			return {
				success: true,
				message: '请求成功',
				data
			};

		case statusCode === 400:
			return {
				success: false,
				message: '请求参数错误'
			};

		case statusCode === 401:
			return {
				success: false,
				message: '登录信息失效'
			};

		case statusCode === 403:
			return {
				success: false,
				message: '没有权限访问该资源'
			};

		case statusCode === 404:
			return {
				success: false,
				message: '资源未找到'
			};

		case statusCode >= 500:
			return {
				success: false,
				message: '服务器内部错误，请稍后再试'
			};

		default:
			return {
				success: false,
				message: `未知错误(${statusCode})`
			};
	}
}

export class NetManager {
	/** 服务地址 */
	private static server = '';
	/** header参数 */
	private static header = {};
	/** 当前请求的数据 */
	private currentRequestData: any = {};
	/** 当前请求的header */
	private currentRequestHeader: any = {};
	/** 当前请求的服务器地址前缀 */
	private currentRequestServer: string = '';

	private static _instance: NetManager;

	public static get instance() {
		if (!NetManager._instance) {
			NetManager._instance = new NetManager();
			NetManager._instance.init();
		}

		return NetManager._instance;
	}

	private constructor() {}

	private init() {
		NetManager.server = ConfigManager.instance.get('app.netServer');
		NetManager.header = ConfigManager.instance.get('app.netHeader');
	}

	/** 设置header */
	public setHeader(header: object, isNew = false): this {
		if (isNew) {
			NetManager.header = {
				...ConfigManager.instance.get('app.netHeader'),
				...header
			};
		} else {
			NetManager.header = {
				...NetManager.header,
				...header
			};
		}
		return this;
	}

	/** 设置请求的数据 */
	public data(data: any): this {
		this.currentRequestData = data;
		return this;
	}

	/** 设置请求的header */
	public header(header: any): this {
		this.currentRequestHeader = header;
		return this;
	}

	/** 设置请求的server */
	public server(server: any): this {
		this.currentRequestServer = server;
		return this;
	}

	/** 发起GET请求 */
	public get<T>(path: string): Promise<ResultData<T>> {
		return this.sendRequest('GET', path);
	}

	/** 发起POST请求 */
	public post<T>(path: string): Promise<ResultData<T>> {
		return this.sendRequest('POST', path);
	}

	/** 发起PUT请求 */
	public put<T>(path: string): Promise<ResultData<T>> {
		return this.sendRequest('PUT', path);
	}

	private sendRequest<T>(method: Methods, path: string): Promise<ResultData<T>> {
		// 优先使用临时请求服务器前缀
		const base = this.currentRequestServer || NetManager.server;
		const url = base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
		const localToken = smc.account.token;

		const options = {
			url: url,
			data: this.currentRequestData,
			header: {
				...NetManager.header,
				...(localToken ? { token: localToken } : {}),
				...this.currentRequestHeader
			}
		};

		this.currentRequestData = {}; // 清空当前请求数据
		this.currentRequestHeader = {}; // 清空当前请求头
		this.currentRequestServer = ''; // 清空当前请求服务器前缀

		return new Promise((resolve, reject) => {
			wx.request({
				method: method,
				url: options.url,
				data: options.data,
				header: options.header,
				success: (response) => {
					const { statusCode, data } = response;
					const result = handleStatusCode(statusCode, data);
					if (result.success) {
						if (result.data.code === 401) {
							smc.account.loginQuit(() => {
								wx.reLaunch({ url: '/pages/login/login' });
							});
						}
						resolve(result.data);
					} else {
						resolve({
							code: statusCode,
							msg: result.message
						});
					}
				},
				fail: (err) => {
					console.log(err);
					this.processError(err.errMsg);
					reject(err.errMsg);
				}
			});
		});
	}

	/** 发起文件上传请求 */
	public upload(options: {
		path: string;
		filePath: string;
		name?: string;
		formData?: Record<string, any>;
	}): Promise<any> {
		const { path, filePath, name = 'file', formData = {} } = options;

		const base = this.currentRequestServer || NetManager.server;
		const url = base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');

		const headers = {
			...NetManager.header,
			...this.currentRequestHeader,
			'content-type': 'multipart/form-data'
		};

		// 清空临时数据
		this.currentRequestHeader = {};
		this.currentRequestServer = '';

		return new Promise((resolve, reject) => {
			wx.uploadFile({
				url,
				filePath,
				name,
				formData,
				header: headers,
				success: (response) => {
					let { statusCode, data } = response;
					const result = handleStatusCode(statusCode, data);
					if (result.success) {
						try {
							data = JSON.parse(data);
						} catch (e) {
							return reject('返回数据格式错误');
						}
						resolve(data);
					} else {
						resolve({
							code: statusCode,
							msg: result.message
						});
					}
				},
				fail: (err) => {
					this.processError(err.errMsg);
					reject(err.errMsg || '上传失败');
				}
			});
		});
	}

	/** 提取错误信息 */
	private processError(errMsg: string): void {
		// const msg = errMsg.replace(/^request:fail\s*/, "");
		wx.showToast({
			title: errMsg,
			icon: 'none'
		});
	}
}
