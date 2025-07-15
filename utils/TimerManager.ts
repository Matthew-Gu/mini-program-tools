export class Timer {
	id: string;
	startTime: number;
	duration: number | null;
	interval: number;
	isCountdown: boolean;
	onTimeChange?: (elapsedTime: number) => void;
	onTimeFinished?: (isAutoStop: boolean) => void;
	timeoutId: ReturnType<typeof setTimeout> | null = null;
	remainingTime: number | null = null;

	constructor(
		id: string,
		options: {
			duration?: number | null;
			interval?: number;
			isCountdown?: boolean;
			onTimeChange?: (elapsedTime: number) => void;
			onTimeFinished?: (isAutoStop: boolean) => void;
		}
	) {
		this.id = id;
		this.startTime = Date.now();
		this.duration = options.duration ?? null;
		this.interval = options.interval ?? 1000; // 默认 1000 毫秒
		this.isCountdown = options.isCountdown ?? true; // 默认 true
		this.onTimeChange = options.onTimeChange;
		this.onTimeFinished = options.onTimeFinished;
	}

	start(): void {
		if (this.timeoutId) return;
		if (this.remainingTime) {
			this.startTime = Date.now() - (this.duration! - this.remainingTime);
		} else {
			this.startTime = Date.now();
		}
		this.tick();
	}

	stop(isAutoStop = false): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		if (this.onTimeFinished && isAutoStop) this.onTimeFinished(isAutoStop);
	}

	pause(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		if (this.duration) {
			const now = Date.now();
			const elapsedTime = now - this.startTime;
			this.remainingTime = this.duration - elapsedTime;
		}
	}

	restart(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}

		this.remainingTime = null;
		this.start();
	}

	private tick(): void {
		const now = Date.now();
		let elapsedTime = now - this.startTime;
		let timeLeft =
			this.duration !== null ? this.duration - elapsedTime : null;

		if (this.isCountdown && timeLeft !== null && timeLeft <= 0) {
			this.stop(true); // 自动停止
			return;
		}

		if (this.onTimeChange) this.onTimeChange(elapsedTime);

		const delay = this.interval - (elapsedTime % this.interval);

		this.timeoutId = setTimeout(() => this.tick(), delay);
	}
}

class PollingTimer extends Timer {
	onTick: () => Promise<boolean>;

	constructor(
		id: string,
		options: {
			interval?: number;
			onTick: () => Promise<boolean>;
			onTimeChange?: (elapsedTime: number) => void;
			onTimeFinished?: (isAutoStop: boolean) => void;
		}
	) {
		super(id, options);
		this.onTick = options.onTick;
	}

	start(): void {
		if (this.timeoutId) return;
		this.poll();
	}

	stop(isAutoStop = false): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		if (this.onTimeFinished) this.onTimeFinished(isAutoStop);
	}

	private async poll(): Promise<void> {
		const startTime = Date.now();

		try {
			const shouldStop = await this.onTick();

			if (shouldStop) {
				this.stop(true); // 自动停止
				return;
			}

			const elapsedTime = Date.now() - startTime;
			const nextInterval = Math.max(this.interval - elapsedTime, 0);
			this.timeoutId = setTimeout(() => this.poll(), nextInterval);
		} catch (error) {
			console.error(`Polling failed: ${error}`);
			this.stop(true);
		}
	}
}

export class TimerManager {
	private static _instance: TimerManager;
	private timers: Map<string, Timer> = new Map();

	public static get instance() {
		if (!TimerManager._instance) {
			TimerManager._instance = new TimerManager();
		}
		return TimerManager._instance;
	}

	private uniqid(): string {
		let d = new Date().getTime();
		let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g,
			(c) => {
				let r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
			}
		);
		return uuid;
	}

	/** 创建定时器 */
	addTimer(options: {
		/** 倒计时时长，单位毫秒 */
		duration?: number | null;
		/** 计时器间隔，单位毫秒 */
		interval?: number;
		/** 是否为倒计时 */
		isCountdown?: boolean;
		/** 倒计时变化时调用的函数 */
		onTimeChange?: (elapsedTime: number) => void;
		/** 倒计时结束时调用的函数 */
		onTimeFinished?: (isAutoStop: boolean) => void;
	}): Timer {
		const id = this.uniqid();
		if (this.timers.has(id)) throw new Error('已存在相同id的定时器');

		const timer = new Timer(id, options);
		this.timers.set(id, timer);
		return timer;
	}

	/** 创建轮询定时器 */
	addPollingTimer(options: {
		/** 轮询间隔，单位毫秒 */
		interval?: number;
		/** 轮询函数 */
		onTick: () => Promise<boolean>;
		/** 轮询结束函数 */
		onTimeFinished?: () => void;
	}): PollingTimer {
		const id = this.uniqid();
		const pollingTimer = new PollingTimer(id, options);
		this.timers.set(id, pollingTimer);
		return pollingTimer;
	}
	/** 开始执行定时器 */
	startTimer(id: string): void {
		const timer = this.timers.get(id);
		if (!timer) throw new Error(`未找到id为 ${id} 的定时器`);
		timer.start();
	}
	/** 停止执行定时器 */
	stopTimer(id: string): void {
		const timer = this.timers.get(id);
		if (!timer) throw new Error(`未找到id为 ${id} 的定时器`);
		timer.stop();
	}
	/** 清除定时器 */
	removeTimer(id: string): void {
		this.stopTimer(id);
		this.timers.delete(id);
	}
	/** 清除所有定时器 */
	clearAll(): void {
		for (const [id] of this.timers) {
			this.removeTimer(id);
		}
	}
}
