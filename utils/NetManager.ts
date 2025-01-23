import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

type Methods =
	| 'OPTIONS'
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'TRACE'
	| 'CONNECT';

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
	private currentRequestServer = '';

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
		if (ConfigManager.instance.get('app.debug')) {
			NetManager.server = ConfigManager.instance.get('app.netDevServer');
		} else {
			NetManager.server = ConfigManager.instance.get(
				'app.netOnlineServer'
			);
		}

		NetManager.header = ConfigManager.instance.get('app.netHeader');
	}

	/** 设置header */
	public setHeader(header: object, isNew = false): this {
		if (isNew) {
			NetManager.header = Object.assign(
				ConfigManager.instance.get('app.netHeader'),
				header
			);
		} else {
			NetManager.header = Object.assign(NetManager.header, header);
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
	public server(server: string): this {
		this.currentRequestServer = server;
		return this;
	}

	/** 发起GET请求 */
	public get(path: string): Promise<any> {
		return this.sendRequest('GET', path);
	}

	/** 发起POST请求 */
	public post(path: string): Promise<any> {
		return this.sendRequest('POST', path);
	}

	/** 发起PUT请求 */
	public put(path: string): Promise<any> {
		return this.sendRequest('PUT', path);
	}

	private sendRequest(method: Methods, path: string): Promise<any> {
		// 优先使用临时请求服务器前缀
		const url = `${this.currentRequestServer || NetManager.server}${
			path ? '/' + path : ''
		}`;

		const options = {
			url: url,
			data: this.currentRequestData,
			header: Object.assign(
				{},
				NetManager.header,
				this.currentRequestHeader
			)
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
					if (
						response.statusCode === 200 &&
						smc.account.netResponseVerify(response.data)
					) {
						resolve(response.data);
					} else {
						resolve(response.errMsg || 'Request failed');
					}
				},
				fail: (error) => {
					reject(error.errMsg);
				}
			});
		});
	}
}
