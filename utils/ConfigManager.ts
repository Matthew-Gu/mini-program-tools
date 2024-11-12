import config from '../config';

export class ConfigManager {
    private static _instance: ConfigManager;

    protected config: Map<string, any> = new Map([]);

    public static get instance() {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
            ConfigManager._instance.set(config);
        }

        return ConfigManager._instance;
    }

    private constructor() {}

    /** 检查配置是否存在 */
    public has(name: string): boolean {
        return this.config.has(name);
    }

    /** 写入配置 */
    public set(values: object, name?: string): void {
        if (name) {
            if (this.has(name)) {
                let config = this.config.get(name);
                config = Object.assign(config, values);
                this.config.set(name, config);
            } else {
                this.config.set(name, values);
            }
        } else {
            for (let name in values) {
                this.set(Reflect.get(values, name), name);
            }
        }
    }

    /** 获取配置 */
    public get(name: string, defaultValue: any = null): any {
        if (!name) {
            return defaultValue;
        }

        if (name.indexOf('.') <= 0) {
            let value = this.config.get(name);
            if (!value) {
                value = defaultValue;
            }

            return value;
        }

        let arr = name.split('.');
        let config = this.config.get(arr[0]);
        arr.shift();

        try {
            arr.forEach((val, i) => {
                if (config[val] !== undefined) {
                    config = config[val];
                } else {
                    return defaultValue;
                }
            });
        } catch (error) {
            return defaultValue;
        }

        return config;
    }

    /** 删除配置 */
    public delete(name: string): void {
        if (this.has(name)) {
            this.config.delete(name);
        }
    }
}
