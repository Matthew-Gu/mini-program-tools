// develop | trial | release
const { envVersion } = wx.getAccountInfoSync().miniProgram;
let isDebug = false;
isDebug = envVersion === "develop" || envVersion === "trial";

/** 生产环境接口地址 */
let netServer = "https://xzt.wxlez.com";
/** 开发环境接口地址 */
let devServer = "https://test.xzt.wxlez.com";

const config = {
  app: {
    /** 环境 */
    env: envVersion,
    /** 品牌名称 */
    brand: "{{brandName}}",
    /** 分享名称 */
    shareTitle: "{{shareTitle}}",
    /** 开发环境 */
    debug: isDebug,
    /** 网络请求Header设置 */
    netHeader: { "content-type": "application/json" },
    /** 开启模拟数据 */
    simulationData: false,
    /** 根据环境变量动态设置服务器地址 */
    netServer: isDebug ? devServer : netServer,
  },
};

export default config;
