import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

type Methods = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';

type Config = {
	loading?: boolean;
};

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
	/** 需要loading请求的数量 */
	private needLoadingRequestCount = 0;

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
		NetManager.server = ConfigManager.instance.get('netServer');
		NetManager.header = ConfigManager.instance.get('netHeader');
	}

	/** 设置header */
	public setHeader(header: object, isNew = false): this {
		if (isNew) {
			NetManager.header = Object.assign(ConfigManager.instance.get('netHeader'), header);
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
	public server(server: any): this {
		this.currentRequestServer = server;
		return this;
	}

	/** 发起GET请求 */
	public get<T>(path: string, config?: Config): Promise<T> {
		return this.sendRequest('GET', path, config);
	}

	/** 发起POST请求 */
	public post<T>(path: string, config?: Config): Promise<T> {
		return this.sendRequest('POST', path, config);
	}

	/** 发起PUT请求 */
	public put<T>(path: string, config?: Config): Promise<T> {
		return this.sendRequest('PUT', path, config);
	}

	private sendRequest<T>(method: Methods, path: string, config?: Config): Promise<T> {
		// 优先使用临时请求服务器前缀
		const url = `${this.currentRequestServer || NetManager.server}${path ? '/' + path : ''}`;

		const options = {
			url: url,
			data: this.currentRequestData,
			header: Object.assign({}, NetManager.header, this.currentRequestHeader),
			loading: config?.loading ?? true
		};

		this.currentRequestData = {}; // 清空当前请求数据
		this.currentRequestHeader = {}; // 清空当前请求头
		this.currentRequestServer = ''; // 清空当前请求服务器前缀

		options.loading && this.showLoading();
		return new Promise((resolve, reject) => {
			wx.request({
				method: method,
				url: options.url,
				data: options.data,
				header: options.header,
				success: (response) => {
					options.loading && this.tryHideLoading();
					if (response.statusCode === 200 && this.netResponseVerify(response.data)) {
						resolve(response.data as T);
					} else {
						reject(response.errMsg || 'Request failed');
					}
				},
				fail: (error) => {
					this.tryHideLoading();
					reject(error.errMsg);
				}
			});
		});
	}

	private showLoading() {
		this.needLoadingRequestCount++;
		wx.showLoading({
			title: '加载中',
			mask: true
		});
	}

	private tryHideLoading() {
		if (this.needLoadingRequestCount <= 0) return;
		this.needLoadingRequestCount--;
		if (this.needLoadingRequestCount === 0) {
			wx.hideLoading();
		}
	}

	/** 网络请求响应验证 */
	private netResponseVerify(response: any): boolean {
		if (response.code == 401) {
			smc.account.loginQuit();

			wx.reLaunch({
				url: '/pages/login/index',
				success: () => {
					wx.showToast({
						title: '登录信息失效',
						icon: 'none'
					});
				}
			});
			return false;
		} else {
			return true;
		}
	}
}
