// develop | trial | release
const { envVersion } = wx.getAccountInfoSync().miniProgram;

const config = {
    app: {
        /** 开发环境 */
        debug: false,
        /** 网络请求Header设置 */
        netHeader: { 'content-type': 'application/json' },
        /** 开启模拟数据 */
        simulationData: false,
        /** 生产环境接口地址 */
        netOnlineServer: '',
        /** 开发环境接口地址 */
        netDevServer: ''
    }
};

switch (envVersion) {
    case 'develop':
        config.app.debug = true;
        break;
    case 'trial':
        config.app.debug = true;
        break;
    case 'release':
        config.app.debug = false;
        break;
    default:
        config.app.debug = false;
        break;
}

export default config;
