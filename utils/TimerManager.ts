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

// * example
// const manager = TimerManager.instance;
// // 计时器可以通过manager启动或关闭，也可以自己启动
// const onTimeChange = (elapsedTime: number): void => console.log(`已经过: ${elapsedTime / 1000} 秒`);
// const onTimeFinished = (): void => console.log('计时结束！');

// // 添加一个5秒的倒计时，每秒更新一次
// const countdownOptions = {
//     duration: 5 * 1000,
//     onTimeChange,
//     onTimeFinished
// };
// const countdownTimer = manager.addTimer(countdownOptions);
// countdownTimer.start();
// manager.startTimer(countdownTimer.id);

// // 添加一个正计时，每秒更新一次
// const countupOptions = {
//     isCountdown: false,
//     interval: 1000,
//     onTimeChange,
//     onTimeFinished
// };
// const countupTimer = manager.addTimer(countupOptions);
// countupTimer.start();
// manager.startTimer(countupTimer.id);
// setTimeout(() => {
//     // 3秒后停止计时
//     countupTimer.stop();
//     manager.stopTimer(countupTimer.id);
// }, 3000);

// let count = 0; // 设定一个计数器作为停止条件

// const pollingOptions = {
//     interval: 2000, // 每2秒轮询一次
//     onTick: async () => {
//         let retryCount = 0;
//         const maxRetries = 5; // 最大重试次数

//         count += 1;
//         console.log(`Count: ${count}`);

//         try {
//             // 假设当计数为5时停止轮询
//             if (count >= 5) {
//                 console.log('条件达成，停止轮询');
//                 return true; // 返回 true，表示需要停止轮询
//             }
//             await new Promise((resolve) => setTimeout(resolve, 1000)); // 每次操作耗时1秒
//             return false; // 返回 false，表示继续轮询
//         } catch (error) {
//             retryCount++;
//             if (retryCount >= maxRetries) {
//                 console.error('达到最大重试次数，停止轮询');
//                 return true;
//             }
//             return false;
//         }
//     }
// };

// // 创建轮询定时器并启动
// const pollingTimer = manager.addPollingTimer(pollingOptions);
// pollingTimer.start();
// manager.startTimer(pollingTimer.id);
