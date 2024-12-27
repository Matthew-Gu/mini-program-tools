export class EventManager {
	private events: Map<string, Set<Function>> = new Map();
	private functionCache: WeakMap<Function, string> = new WeakMap();

	private static _instance: EventManager;

	public static get instance() {
		if (!EventManager._instance) {
			EventManager._instance = new EventManager();
		}
		return EventManager._instance;
	}

	private getFunctionIdentifier(fn: Function): string {
		if (!this.functionCache.has(fn)) {
			const identifier = fn.toString(); // 生成唯一标识符
			this.functionCache.set(fn, identifier);
		}
		return this.functionCache.get(fn)!;
	}

	public on(eventName: string, fn: Function): void {
		const fnIdentifier = this.getFunctionIdentifier(fn);

		if (this.events.has(eventName)) {
			const handlers = this.events.get(eventName);
			// 比较回调函数的标识符
			if (
				![...handlers!].some(
					(handler) =>
						this.getFunctionIdentifier(handler) === fnIdentifier
				)
			) {
				// 防止函数重复注册
				handlers?.add(fn);
			}
		} else {
			const handlers = new Set<Function>();
			handlers.add(fn);
			this.events.set(eventName, handlers);
		}
	}

	public once(eventName: string, fn: Function): void {
		const wrappedFn = (...args: any[]) => {
			this.off(eventName, wrappedFn);
			fn(...args);
		};

		this.on(eventName, wrappedFn);
	}

	public off(eventName: string, fn?: Function): void {
		if (this.events.has(eventName)) {
			let handlers: Set<Function> = this.events.get(eventName)!;
			if (!fn) {
				this.events.delete(eventName);
				return;
			}
			handlers.delete(fn);
			if (handlers.size === 0) {
				this.events.delete(eventName);
			}
		}
	}

	public emit(eventName: string, ...args: any): void {
		if (this.events.has(eventName)) {
			this.events.get(eventName)?.forEach((fn) => {
				if (typeof fn === 'function') {
					fn(...args);
				}
			});
		} else {
			console.warn(`event "${eventName}" is not exist`);
		}
	}

	public clear(): void {
		this.events.clear();
	}

	public clearEvent(eventName: string): void {
		this.off(eventName);
	}
}
