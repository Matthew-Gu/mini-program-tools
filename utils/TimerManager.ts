class Timer {
    id: string;
    startTime: number;
    duration: number | null;
    interval: number;
    isCountdown: boolean;
    onTimeChange?: (elapsedTime: number) => void;
    onTimeFinished?: () => void;
    timeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor(
        id: string,
        options: {
            duration?: number | null;
            interval?: number;
            isCountdown?: boolean;
            onTimeChange?: (elapsedTime: number) => void;
            onTimeFinished?: () => void;
        }
    ) {
        this.id = id;
        this.startTime = Date.now();
        this.duration = options.duration ?? null;
        this.interval = options.interval ?? 1000; // 默认为 1000 毫秒
        this.isCountdown = options.isCountdown ?? true; // 默认为 true
        this.onTimeChange = options.onTimeChange;
        this.onTimeFinished = options.onTimeFinished;
    }

    start(): void {
        if (this.timeoutId) return;
        this.tick();
    }

    stop(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            if (this.onTimeFinished) this.onTimeFinished();
            this.timeoutId = null;
        }
    }

    private tick(): void {
        const now = Date.now();
        let elapsedTime = now - this.startTime;
        let timeLeft = this.duration !== null ? this.duration - elapsedTime : null;

        if (this.isCountdown && timeLeft !== null && timeLeft <= 0) {
            this.stop();
            return;
        }

        if (this.onTimeChange) this.onTimeChange(elapsedTime);

        const delay = this.interval - (elapsedTime % this.interval);

        this.timeoutId = setTimeout(() => this.tick(), delay);
    }
}

class PollingTimer extends Timer {
    onTick: () => Promise<boolean>; // 修改为返回一个布尔值，指示是否停止轮询
    lastExecutionTime: number;

    constructor(
        id: string,
        options: {
            interval?: number;
            onTick: () => Promise<boolean>; // onTick 返回是否需要停止轮询的标志
            onTimeChange?: (elapsedTime: number) => void;
            onTimeFinished?: () => void;
        }
    ) {
        super(id, options); // 调用父类构造函数
        this.onTick = options.onTick;
        this.lastExecutionTime = Date.now();
    }

    start(): void {
        if (this.timeoutId) return;
        this.poll();
    }

    stop(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            if (this.onTimeFinished) this.onTimeFinished();
            this.timeoutId = null;
        }
    }

    private async poll(): Promise<void> {
        const startTime = Date.now();

        try {
            // 执行异步操作并判断是否需要停止轮询
            const shouldStop = await this.onTick();

            if (shouldStop) {
                this.stop(); // 如果满足条件，停止轮询
                return;
            }

            const elapsedTime = Date.now() - startTime;
            const nextInterval = Math.max(this.interval - elapsedTime, 0); // 时间补偿，确保不会出现负值
            this.timeoutId = setTimeout(() => this.poll(), nextInterval);
        } catch (error) {
            // 错误处理
            console.error(`Polling failed: ${error}`);
            this.stop();
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
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    addTimer(options: {
        duration?: number | null;
        interval?: number;
        isCountdown?: boolean;
        onTimeChange?: (elapsedTime: number) => void;
        onTimeFinished?: () => void;
    }): Timer {
        const id = this.uniqid();
        if (this.timers.has(id)) throw new Error('已存在相同id的定时器');

        const timer = new Timer(id, options);
        this.timers.set(id, timer);
        return timer;
    }

    addPollingTimer(options: {
        interval: number;
        onTick: () => Promise<boolean>; // 修改为返回布尔值的异步方法
        onTimeChange?: (elapsedTime: number) => void;
        onTimeFinished?: () => void;
    }): PollingTimer {
        const id = this.uniqid();
        const pollingTimer = new PollingTimer(id, options);
        this.timers.set(id, pollingTimer);
        return pollingTimer;
    }

    startTimer(id: string): void {
        const timer = this.timers.get(id);
        if (!timer) throw new Error(`未找到id为 ${id} 的定时器`);
        timer.start();
    }

    stopTimer(id: string): void {
        const timer = this.timers.get(id);
        if (!timer) throw new Error(`未找到id为 ${id} 的定时器`);
        timer.stop();
    }

    removeTimer(id: string): void {
        this.stopTimer(id);
        this.timers.delete(id);
    }

    clearAll(): void {
        for (const [id] of this.timers) {
            this.removeTimer(id);
        }
    }
}
