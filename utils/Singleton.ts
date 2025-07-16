import { Account } from './Account';
import { CacheManager } from './CacheManager';
import { ConfigManager } from './ConfigManager';
import { EventManager } from './EventManager';
import { NetManager } from './NetManager';
import { TimerManager } from './TimerManager';
import { TabManager } from './TabManager';

export class SingletonModule {
	/** 账号模块 */
	public account: Account = new Account();

	/** 事件模块 */
	public get event(): EventManager {
		return EventManager.instance;
	}

	/** 配置模块 */
	public get config(): ConfigManager {
		return ConfigManager.instance;
	}

	/** 计时器模块及轮询 */
	public get timer(): TimerManager {
		return TimerManager.instance;
	}

	/** 网络请求模块 */
	public get net(): NetManager {
		return NetManager.instance;
	}

	/** 数据缓存模块 */
	public get cache(): CacheManager {
		return CacheManager.instance;
	}

	/** 动态菜单模块 */
	public get tab(): TabManager {
		return TabManager.instance;
	}
}

export let smc: SingletonModule = new SingletonModule();

// const timer = smc.timer.addTimer({
//     duration: 5 * 1000,
//     interval: 1000,
//     isCountdown: true,
//     onTimeChange: () => {
//         console.log('change');
//     },
//     onTimeFinished: () => {
//         console.log('finished');
//     }
// });

// timer.start();
// smc.timer.startTimer(timer.id);

// let count = 0;
// const polling = smc.timer.addPollingTimer({
//     interval: 1000,
//     onTick: async () => {
//         count += 1;
//         console.log('count', count);

//         // // 假设当计数器达到5时停止轮询
//         // if (count >= 5) {
//         //     console.log('Condition met, stopping polling.');
//         //     return true; // 返回 true，表示需要停止轮询
//         // }

//         // // 模拟异步操作
//         // await new Promise((resolve) => setTimeout(resolve, 1000)); // 每次操作耗时1秒
//         // return false; // 返回 false，表示继续轮询

//         try {
//             if (count >= 5) {
//                 console.log('Condition met, stopping polling.');
//                 return true; // 返回 true，表示需要停止轮询
//             }
//             await new Promise((resolve) => setTimeout(resolve, 1000)); // 每次操作耗时1秒
//             return false; // 返回 false，表示继续轮询
//         } catch (error) {
//             return false;
//         }
//     }
// });

// polling.start();
// smc.timer.startTimer(polling.id);
