// 引入文件系统模块和路径处理模块
const fs = require('fs');
const path = require('path');

// 定义不同环境的配置信息
const ENV_CONFIG = {
	zxs: {
		appid: '',
		projectname: '小程序',
		shareTitle: ''
	}
};

// 从命令行参数中获取当前环境标识
const env = process.argv[2];
// 根据环境标识获取对应的配置
const config = ENV_CONFIG[env];

// 如果没有找到对应环境的配置，输出错误并退出程序
if (!config) {
	console.error('❌ 环境参数错误！');
	process.exit(1);
}

// 定义模板文件路径和输出文件路径
const templatePath = path.resolve(__dirname, 'project.config.template.json');
const outputPath = path.resolve(__dirname, 'project.config.json');

// 读取模板文件内容
const jsonTemplate = fs.readFileSync(templatePath, 'utf-8');

// 替换模板中的占位符（{{appid}} 和 {{projectname}}）
const jsonOutput = jsonTemplate.replace('{{appid}}', config.appid).replace('{{projectname}}', config.projectname);

// 将替换后的内容写入到 project.config.json 文件中
fs.writeFileSync(outputPath, jsonOutput);

// 处理 config.ts 配置文件
const templateConfigPath = path.resolve(__dirname, 'config.template.ts');
const templateOutPath = path.resolve(__dirname, 'miniprogram', 'config.ts');

// 读取 config.template.ts 模板内容
const configTemplate = fs.readFileSync(templateConfigPath, 'utf-8');

// 在替换前向 config.ts 文件内容的开头添加提示信息
// 表示该文件由脚本生成，不应手动修改
const configOutput =
	'// ⚠️ 脚本生成，请勿手动修改\n' +
	configTemplate.replace('{{brandName}}', env).replace('{{shareTitle}}', config.shareTitle);

// 将替换后的内容写入到 miniprogram/config.ts 文件中
fs.writeFileSync(templateOutPath, configOutput);

// 输出成功提示信息
console.log(`✅ 已切换至「${env}」环境，写入 appid: ${config.appid}`);
