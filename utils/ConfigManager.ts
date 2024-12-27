import config from '../config';

export class ConfigManager {
	private static _instance: ConfigManager;
	protected config: Map<string, any> = new Map();

	private constructor() {}

	/** 获取 ConfigManager 实例 */
	public static get instance(): ConfigManager {
		if (!ConfigManager._instance) {
			ConfigManager._instance = new ConfigManager();
			ConfigManager._instance.set(config); // 默认配置
		}
		return ConfigManager._instance;
	}

	/** 检查配置是否存在 */
	public has(name: string): boolean {
		return this.config.has(name);
	}

	/** 设置单个或多个配置项 */
	public set(values: object, name?: string): void {
		if (name) {
			// 只在值是对象时进行深合并，不拆分字符串
			if (this.has(name)) {
				let existingConfig = this.config.get(name);
				if (typeof values === 'object' && !Array.isArray(values)) {
					existingConfig = { ...existingConfig, ...values };
				} else {
					existingConfig = values;
				}
				this.config.set(name, existingConfig);
			} else {
				this.config.set(name, values);
			}
		} else if (values && typeof values === 'object') {
			// 批量设置配置项
			Object.entries(values).forEach(([key, value]) => {
				this.set(value, key);
			});
		}
	}

	/** 获取配置，支持嵌套路径访问 */
	public get(name: string, defaultValue: any = null): any {
		if (!name) return defaultValue;

		const keys = name.split('.');
		let result = this.config.get(keys[0]);

		if (!result) return defaultValue;

		try {
			for (const key of keys.slice(1)) {
				result = result ? result[key] : undefined;
				if (result === undefined) return defaultValue;
			}
		} catch {
			return defaultValue;
		}

		return result ?? defaultValue;
	}

	/** 删除配置 */
	public delete(name: string): void {
		this.config.delete(name);
	}
}
