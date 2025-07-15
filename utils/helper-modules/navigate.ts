/** 自定义跳转 */
export function navigateByDataset(
  e: WechatMiniprogram.BaseEvent,
  pageMap: Record<string, (dataset?: any) => string>
) {
  const dataset = e.currentTarget?.dataset;
  const pageKey = dataset?.page;
  const func = pageMap[pageKey];
  const url = func?.(dataset); // 传 dataset 给路径函数

  if (url) {
    wx.navigateTo({
      url,
      fail(error) {
        console.warn(`跳转失败:`, error);
      },
    });
  } else {
    console.warn(`未找到 pageMap 中对应的页面: ${pageKey}`);
  }
}

type CallbackMode = "redirectTo" | "switchTab" | "reLaunch" | "navigateTo";

interface CallbackObj {
  callbackUrl: string;
  mode: CallbackMode;
}

const STORAGE_KEY = "callbackObj";

let callbackObj: CallbackObj | null = null;

// 初始化，尝试从 storage 读取缓存
function init() {
  if (!callbackObj) {
    const stored = wx.getStorageSync(STORAGE_KEY);
    if (stored) {
      callbackObj = stored as CallbackObj;
    }
  }
}

/** 清除缓存 */
function clearCallback() {
  callbackObj = null;
  wx.removeStorageSync(STORAGE_KEY);
}

/** 设置当前页面为回调地址 */
export function setCallbackUrl(
  mode: CallbackMode = "redirectTo"
): Promise<void> {
  return new Promise((resolve) => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const { route, options = {} } = currentPage;

    const query = Object.entries(options)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const url = `/${route}${query ? `?${query}` : ""}`;

    callbackObj = {
      callbackUrl: url,
      mode,
    };

    wx.setStorageSync(STORAGE_KEY, callbackObj);
    resolve();
  });
}

/** 获取回调地址并跳转 */
export function getCallbackUrl(): Promise<void> {
  return new Promise((resolve, reject) => {
    init();

    if (!callbackObj || !callbackObj.callbackUrl || !callbackObj.mode) {
      return reject(new Error("无有效回调地址"));
    }

    const modeActions: Record<CallbackMode, (cb: () => void) => void> = {
      redirectTo: (cb) =>
        wx.redirectTo({ url: callbackObj!.callbackUrl, success: cb }),
      switchTab: (cb) =>
        wx.switchTab({ url: callbackObj!.callbackUrl, success: cb }),
      reLaunch: (cb) =>
        wx.reLaunch({ url: callbackObj!.callbackUrl, success: cb }),
      navigateTo: (cb) =>
        wx.navigateTo({ url: callbackObj!.callbackUrl, success: cb }),
    };

    const action = modeActions[callbackObj.mode];
    if (!action) return reject(new Error("跳转模式不支持"));

    action(() => {
      clearCallback();
      resolve();
    });
  });
}
