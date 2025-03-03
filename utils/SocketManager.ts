import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

export class SocketManager {
	private static _instance: SocketManager;
	// 开启标识
	state = false;
	private socket: WechatMiniprogram.SocketTask | null = null;
	private server = '';
	private header = {};
	// 是否自动重连
	private is_reconnect = true;
	// 重连次数
	private reconnect_count = 3;
	// 已发起重连次数
	private reconnect_current = 1;
	// 重连timer
	private reconnect_timer: number | null = null;
	// 重连频率
	private reconnect_interval = 3000;
	// 心跳timer
	private hearbeat_timer: number | null = null;
	// 心跳发送频率
	private hearbeat_interval = 20000;

	public static get instance() {
		if (!SocketManager._instance) {
			SocketManager._instance = new SocketManager();
		}
		return SocketManager._instance;
	}

	public connect(options?: {
		server?: string;
		header?: Record<string, string>;
		isReconnect?: boolean; // 是否自动重连
		reconnectCount?: number; // 重连次数
		reconnectInterval?: number; // 重连频率
		hearbeatInterval?: number; // 心跳发送频率
	}) {
		const {
			server,
			header,
			isReconnect,
			reconnectCount,
			reconnectInterval,
			hearbeatInterval
		} = options || {};
		this.server =
			server ??
			(ConfigManager.instance.get('app.debug')
				? ConfigManager.instance.get('app.devSocketServer')
				: ConfigManager.instance.get('app.onlineSocketServer'));
		this.header = header ?? ConfigManager.instance.get('app.socketHeader');

		this.is_reconnect = isReconnect ?? this.is_reconnect;
		this.reconnect_count = reconnectCount ?? this.reconnect_count;
		this.reconnect_interval = reconnectInterval ?? this.reconnect_interval;
		this.hearbeat_interval = hearbeatInterval ?? this.hearbeat_interval;

		this.socket = wx.connectSocket({
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
		this.socket.onOpen(() => {
			this.state = true;
			this.is_reconnect = true;
			this.reconnect_current = 1; // 重置重连次数
			// 开启心跳
			this.heartbeat();
		});

		// 关闭连接
		this.socket.onClose((e: any) => {
			console.log('连接已断开', e);
			if (this.hearbeat_timer) {
				clearInterval(this.hearbeat_timer);
				this.hearbeat_timer = null;
			}
			this.state = false;

			// 需要重新连接
			if (this.is_reconnect) {
				this.reconnect_timer = setTimeout(() => {
					// 超过重连次数
					if (this.reconnect_current > this.reconnect_count) {
						console.log('超过重连次数');
						if (this.reconnect_timer) {
							clearTimeout(this.reconnect_timer);
							this.reconnect_timer = null;
						}
						return;
					}

					// 记录重连次数
					this.reconnect_current++;
					this.reconnect();
				}, this.reconnect_interval);
			}
		});

		// 连接发生错误
		this.socket.onError((e: any) => {
			console.log('Socket连接发生错误', e);
		});

		this.socket.onMessage((e: any) => {
			this.onMessage(e);
		});
	}

	public sendMessage(data: any, callback?: Function) {
		// 开启状态直接发送
		if (this.socket) {
			const jsonData = JSON.stringify(data);
			console.log('sendMessage', data);
			this.socket.send({
				data: jsonData,
				complete: (e) => {
					callback?.(e);
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
			this.hearbeat_timer = null;
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
		if (this.hearbeat_timer) {
			clearInterval(this.hearbeat_interval);
			this.hearbeat_timer = null;
		}
		this.is_reconnect = false;
		if (this.socket) {
			this.socket.close({
				code,
				complete: () => {
					console.log('断开连接成功');
					this.socket = null; // 置空 socket 避免触发reconnect
				}
			});
		}
	}

	private reconnect(options?: {
		server?: string;
		header?: Record<string, string>;
		isReconnect?: boolean;
		reconnectCount?: number;
		reconnectInterval?: number;
		hearbeatInterval?: number;
	}) {
		console.log('发起重新连接', this.reconnect_current);

		if (this.socket && this.state) {
			this.closeSocket();
		}

		this.connect(options);
	}
}
