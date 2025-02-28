import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

export class SocketManager {
	private static _instance: SocketManager;
	// 开启标识
	state = false;
	private websock: WechatMiniprogram.SocketTask | null = null;
	private server = '';
	private header = {};
	// 心跳timer
	private hearbeat_timer = -1;
	// 心跳发送频率
	private hearbeat_interval = 20000;
	// 是否自动重连
	private is_reonnect = true;
	// 重连次数
	private reconnect_count = 3;
	// 已发起重连次数
	private reconnect_current = 1;
	// 重连timer
	private reconnect_timer = -1;
	// 重连频率
	private reconnect_interval = 3000;

	public static get instance() {
		if (!SocketManager._instance) {
			SocketManager._instance = new SocketManager();
		}
		return SocketManager._instance;
	}

	public connect() {
		if (ConfigManager.instance.get('app.debug')) {
			this.server = ConfigManager.instance.get('app.devSocketServer');
		} else {
			this.server = ConfigManager.instance.get('app.onlineSocketServer');
		}
		this.header = ConfigManager.instance.get('app.socketHeader');

		this.websock = wx.connectSocket({
			url: `${this.server}?token=${smc.account.token}`,
			header: this.header,
			success: () => {
				console.log('Socket 连接成功');
				this.state = true;
			},
			fail: () => {
				console.log('Socket 连接失败');
				this.state = false;
			}
		});

		// 连接成功
		this.websock.onOpen((e: any) => {
			console.log('连接成功', e);
			this.state = true;
			this.is_reonnect = true;
			// 开启心跳
			this.heartbeat();
		});

		// 关闭连接
		this.websock.onClose((e: any) => {
			console.log('连接已断开', e);
			clearInterval(this.hearbeat_interval);
			this.state = false;

			// 需要重新连接
			if (this.is_reonnect) {
				this.reconnect_timer = setTimeout(() => {
					// 超过重连次数
					if (this.reconnect_current > this.reconnect_count) {
						console.log('超过重连次数');
						clearTimeout(this.reconnect_timer);
						return;
					}

					// 记录重连次数
					this.reconnect_current++;
					this.reconnect();
				}, this.reconnect_interval);
			}
		});

		// 连接发生错误
		this.websock.onError((e: any) => {
			console.log('Socket连接发生错误', e);
		});

		this.websock.onMessage((e: any) => {
			this.onMessage(e);
		});
	}

	public sendMessage(data: any, callback?: Function) {
		// 开启状态直接发送
		if (this.websock) {
			const jsonData = JSON.stringify(data);
			console.log('sendMessage', data);
			this.websock.send({
				data: jsonData,
				complete: () => {
					callback?.();
				}
			});
		}
	}

	public onMessage(message: any) {
		try {
			const params = JSON.parse(message.data);
			console.log('onMessage', params);
			if (params?.data?.ability) {
				smc.event.emit('cmd:' + params.data.ability, params.data);
			}
		} catch (e: any) {
			console.log('onMessage catch', e);
		}
	}

	private heartbeat() {
		if (this.hearbeat_timer) {
			clearInterval(this.hearbeat_timer);
		}

		this.hearbeat_timer = setInterval(() => {
			const data = {
				command: 'ping' // 心跳包
			};
			this.sendMessage(data, () => {
				console.log('socket', 'ping');
			});
		}, this.hearbeat_interval);
	}

	public closeSocket(code = 1000) {
		clearInterval(this.hearbeat_interval);
		this.is_reonnect = false;
		if (this.websock) {
			this.websock.close({
				code,
				complete: () => {
					console.log('断开连接成功');
				}
			});
		}
	}

	private reconnect() {
		console.log('发起重新连接', this.reconnect_current);

		if (this.websock && this.state) {
			this.closeSocket();
		}

		this.connect();
	}
}
