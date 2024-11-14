import { smc } from './utils/Singleton';

App({
    globalData: {
        //全局数据管理
        statusBarHeight: 0, // 状态栏高度
        navBarHeight: 0, // 导航栏高度
        menuBottom: 0, // 胶囊距底部间距（保持底部间距一致）
        menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
        menuHeight: 0 // 胶囊高度（自定义内容可与胶囊高度保证一致）
    },
    async onLaunch() {
        // 获取角色并进行跳转
        try {
            await smc.account.connect();
            if (smc.account.state) {
                wx.reLaunch({ url: '/pages/home/index' });
            } else {
                wx.reLaunch({ url: '/pages/login/index' });
            }
        } catch (error) {
            console.error('connect erro', error);
            wx.reLaunch({ url: '/pages/login/index' });
        }
        // 版本更新逻辑
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            if (res.hasUpdate) {
                updateManager.onUpdateReady(function () {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否重启应用？',
                        success: function (res) {
                            if (res.confirm) {
                                // 新版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        }
                    });
                });
                updateManager.onUpdateFailed(function () {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本下载失败',
                        showCancel: false
                    });
                });
            }
        });
        // 导航栏设置逻辑
        this.setNavBarInfo();
    },
    setNavBarInfo() {
        // 获取系统信息
        const systemInfo = wx.getWindowInfo();
        // 胶囊按钮位置信息
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        this.globalData.statusBarHeight = systemInfo.statusBarHeight;
        // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
        this.globalData.navBarHeight =
            (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
        this.globalData.menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
        this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
        this.globalData.menuHeight = menuButtonInfo.height;

        console.log('golbalData', this.globalData);
    },
    redirect(options) {
        const { url, params = {}, events = {}, keep = true, callback } = options;

        const queryString = Object.keys(params)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        const fullUrl = queryString ? `${url}?${queryString}` : url;

        const successCallback = (res) => {
            if (callback && typeof callback === 'function') {
                callback(null, res);
            }
        };

        const errorCallback = (err) => {
            if (callback && typeof callback === 'function') {
                callback(err);
            }
        };

        if (keep) {
            wx.navigateTo({
                url: fullUrl,
                events: events, // 传递给目标页面的事件
                success: successCallback,
                fail: errorCallback
            });
        } else {
            wx.redirectTo({
                url: fullUrl,
                success: successCallback,
                fail: errorCallback
            });
        }
    },
    shareAppMessage() {
        let pathUrl = `/pages/login/index`;

        return {
            title: '',
            path: pathUrl
        };
    }
});
