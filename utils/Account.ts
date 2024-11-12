import { ConfigManager } from './ConfigManager';
import { smc } from './Singleton';

export class Account {
    private _token: string = '';
    public get token(): string {
        if (this._token == '') {
            let token = smc.cache.get('d_token');
            return token || '';
        } else {
            return this._token;
        }
    }

    public set token(value: string) {
        if (value != '') {
            this._token = value;
            smc.cache.set('d_token', value);
        }
    }

    /** 登录状态 */
    public state: boolean = false;

    /** 微信OPENID */
    private _openid: string = '';
    public get openid(): string {
        if (this._openid == '') {
            let openid = smc.cache.get('d_openid');
            return openid ? openid : '';
        } else {
            return this._openid;
        }
    }

    public set openid(value: string) {
        if (value != '') {
            this._openid = value;
            smc.cache.set('d_openid', value);
        }
    }

    /** 账号登录 */
    public connect(params?: any) {
        return new Promise((resolve, reject) => {
            if (params) {
                smc.net
                    .data(params)
                    .post('')
                    .then((respond: any) => {
                        wx.hideLoading();
                        if (respond.code == 200) {
                            const { token, openId } = respond.data;
                            smc.account.loginSuccess({
                                token,
                                openid: openId
                            });
                            resolve(respond);
                        } else {
                            wx.showToast({
                                title: respond.msg,
                                icon: 'none',
                                duration: 1500
                            });
                            reject(respond.msg);
                        }
                    })
                    .catch((error: any) => {
                        wx.hideLoading();
                        wx.showToast({
                            title: error,
                            icon: 'none'
                        });
                        console.log('login err', error);
                        reject(error);
                    });
            } else {
                if (this.state) {
                    resolve({});
                    return;
                } else if (this.token != '') {
                    this.loginSuccess({
                        token: this.token,
                        openid: this.openid
                    });
                    resolve({});
                } else {
                    reject(new Error('缺少登录参数'));
                }
            }
        });
    }

    /** 账号登录成功 */
    public loginSuccess(params: any): void {
        this.state = true;
        this.token = params.token;
        this.openid = params.openid;
        smc.net.setHeader({ Authorization: params.token }, true);
    }

    /** 账号退出成功 */
    public loginQuit(): void {
        this.state = false;
        this._token = '';
        this._openid = '';
        smc.cache.delete('d_token');
        smc.cache.delete('d_openid');
        smc.net.setHeader({}, true);
        wx.clearStorageSync();
    }

    /** 账号登录授权 */
    public loginAuth(event: any, onFinish?: Function): void {
        if (event.detail.errMsg != 'getPhoneNumber:ok') {
            return;
        }

        wx.login({
            success: (respond: any) => {
                if (respond.errMsg == 'login:ok') {
                    let params = {
                        openidCode: respond.code,
                        phoneCode: event.detail.code
                    };
                    wx.showLoading({ title: '登录中', mask: true });
                    if (ConfigManager.instance.get('app.debug') && ConfigManager.instance.get('app.simulationData')) {
                        this.loginSuccess({ token: 'token', openid: respond.code });
                        wx.hideLoading();
                        if (onFinish) {
                            onFinish();
                        } else {
                            wx.showToast({
                                title: '登录成功',
                                icon: 'none',
                                duration: 1000
                            });
                        }
                    } else {
                        this.connect(params).then(() => {
                            if (onFinish) {
                                onFinish();
                            } else {
                                wx.showToast({
                                    title: '登录成功',
                                    icon: 'none',
                                    duration: 1000
                                });
                            }
                        });
                    }
                }
            }
        });
    }

    /** 网络请求伪造数据 */
    public netSimulationData(params: any): any {
        console.log('params', params);
        let response: any = { code: 200, data: null };
        return response;
    }

    /** 网络请求响应验证 */
    public netResponseVerify(response: any): boolean {
        if (response.code == 401) {
            this.loginQuit();
            wx.reLaunch({
                url: '/pages/login/index',
                success: () => {
                    wx.showToast({
                        title: '登录信息失效',
                        icon: 'none',
                        duration: 1000
                    });
                }
            });
            return false;
        } else {
            return true;
        }
    }
}
