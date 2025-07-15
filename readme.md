# 公版英语自习室配置说明

本项目为 **公版英语自习室**，包含小程序配置及构建脚本。以下说明介绍如何配置环境变量及构建配置文件。

## 环境配置

配置位于 `switch.js` 文件，通过修改 `ENV_CONFIG` 对象管理不同构建环境参数。

示例代码：

```javascript
const ENV_CONFIG = {
	zxs: {
		appid: '',
		projectname: '小程序',
		shareTitle: ''
	}
};
```

> 可通过命令行生成配置文件，例如：
>
> -   `node switch.js zxs`
> -   在 `package.json` 中添加脚本后使用：
>
>     ```
>     npm run zxs
>     ```

---

## 配置文件说明

配置模板文件位于 `config.template.ts`，根据构建环境自动确定接口及参数。

示例代码：

```javascript
// develop | trial | release
const { envVersion } = wx.getAccountInfoSync().miniProgram;
let isDebug = false;
isDebug = envVersion === 'develop' || envVersion === 'trial';

/** 生产环境接口地址 */
let netServer = 'https://example.com';
/** 开发环境接口地址 */
let devServer = 'https://test.example.com';

const config = {
	app: {
		/** 环境 */
		env: envVersion,
		/** 品牌名称 */
		brand: '{{brandName}}',
		/** 分享标题 */
		shareTitle: '{{shareTitle}}',
		/** 当前是否为开发/体验环境 */
		debug: isDebug,
		/** 网络请求Header设置 */
		netHeader: { 'content-type': 'application/json' },
		/** 是否开启模拟数据 */
		simulationData: false,
		/** 网络请求接口，根据当前环境自动切换 */
		netServer: isDebug ? devServer : netServer
	}
};

export default config;
```

---

## 注意事项

-   修改 `switch.js` 中对应字段后，务必重新构建配置。
-   `config.template.ts` 中使用占位符 (`{{brandName}}`、`{{shareTitle}}`)，构建脚本会自动替换为实际值。
-   可根据实际需求修改接口及配置参数。
