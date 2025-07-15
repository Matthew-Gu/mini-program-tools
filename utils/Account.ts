import { smc } from './Singleton';

export class Account {
	private _token: string = '';
	public get token(): string {
		if (this._token == '') {
			let token = smc.cache.get('s_token');
			return token || '';
		} else {
			return this._token;
		}
	}

	public set token(value: string) {
		if (value != '') {
			this._token = value;
			smc.cache.set('s_token', value);
		}
	}

	private _brand: string = '';
	public get brand(): string {
		if (this._brand == '') {
			let brand = smc.cache.get('s_brand');
			return brand || '';
		} else {
			return this._brand;
		}
	}

	public set brand(value: string) {
		if (value != '') {
			this._brand = value;
			smc.cache.set('s_brand', value);
		}
	}

	private _userid: string = '';
	public get userid(): string {
		if (this._userid == '') {
			let userid = smc.cache.get('s_userid');
			return userid || '';
		} else {
			return this._userid;
		}
	}

	public set userid(value: string) {
		if (value != '') {
			this._userid = value;
			smc.cache.set('s_userid', value);
		}
	}

	private _userInfo: { [key: string]: any } | null = null;
	public get userInfo(): { [key: string]: any } | null {
		if (this._userInfo == null) {
			let userInfo = smc.cache.get('s_userInfo');
			return userInfo || null;
		} else {
			return this._userInfo;
		}
	}

	public set userInfo(value: { [key: string]: any } | null) {
		if (value !== null) {
			this._userInfo = value;
			smc.cache.set('s_userInfo', value);
		}
	}

	/** 登录状态 */
	public state: boolean = false;

	/** 微信OPENID */
	private _openid: string = '';
	public get openid(): string {
		if (this._openid == '') {
			let openid = smc.cache.get('s_openid');
			return openid || '';
		} else {
			return this._openid;
		}
	}

	public set openid(value: string) {
		if (value != '') {
			this._openid = value;
			smc.cache.set('s_openid', value);
		}
	}
	/** deptId */
	private _deptId: string = '';
	public get deptId(): string {
		if (this._deptId == '') {
			let deptId = smc.cache.get('s_deptId');
			return deptId || '';
		} else {
			return this._deptId;
		}
	}
	/** 设置deptId */
	public set deptId(value: string) {
		if (value != '') {
			this._deptId = value;
			smc.cache.set('s_deptId', value);
		}
	}

	/** cache */
	private _cache: string = '';
	public get cache(): string {
		if (this._cache == '') {
			let cache = smc.cache.get('s_cache');
			return cache || '';
		} else {
			return this._cache;
		}
	}
	/** 设置deptId */
	public set cache(value: string) {
		if (value != '') {
			this._cache = value;
			smc.cache.set('s_cache', value);
		}
	}

	/** 账号登录 */
	public connect(params?: any) {
		return new Promise((resolve, reject) => {
			if (params) {
				smc.net
					.data({
						code: params.code,
						openid: params.openid,
						deptId: params.deptId,
						phone: params.phone
					})
					.post('prod-api/api/mini/guardian/loginFastByOpenid')
					.then((respond: any) => {
						if (respond.code == 200) {
							const { user } = respond.data;
							const data = {
								token: user.token,
								userid: user.id,
								openid: user.openid,
								deptId: user.schoolId,
								userInfo: user
							};
							if (!params.cancelLogin) {
								smc.account.loginSuccess(data);
							}
							resolve(data);
						} else {
							reject(respond.msg);
							if (respond.code == 209) {
								smc.account.deptId = 'undefined';
								wx.showToast({
									title: '登录信息失效，请重新扫描门店二维码',
									icon: 'none',
									mask: true
								});
								return;
							}
							wx.showToast({
								title: respond.msg,
								icon: 'none',
								duration: 1500
							});
						}
					})
					.catch((error: any) => {
						reject(error);
						wx.showToast({
							title: error,
							icon: 'none'
						});
					});
			} else {
				const data = {
					token: this.token,
					userid: this.userid,
					deptId: this.deptId,
					openid: this.openid,
					userInfo: this.userInfo
				};
				if (this.state) {
					resolve(data);
					return;
				} else if (this.token != '') {
					this.loginSuccess(data);
					resolve(data);
				} else {
					reject('缺少登录参数');
				}
			}
		});
	}

	/** 账号登录成功 */
	public loginSuccess(params: any) {
		this.state = true;
		this.token = params.token;
		this.openid = params.openid;
		this.deptId = params.deptId;
		this.userid = params.userid;
		this.userInfo = params.userInfo;
		smc.net.setHeader(
			{
				token: params.token
			},
			true
		);
	}

	/** 账号退出成功 */
	public loginQuit(cb?: () => void) {
		this.state = false;
		this._token = '';
		this._openid = '';
		this._userid = '';
		this._userInfo = null;
		smc.cache.delete('s_token');
		smc.cache.delete('s_openid');
		smc.cache.delete('s_userid');
		smc.cache.delete('s_userInfo');
		smc.net.setHeader({}, true);
		smc.event.clearAll();

		cb && cb();
	}

	/** 账号登录授权 */
	public loginAuth(event: any, onFinish?: Function, cancelLogin?: boolean) {
		if (event.detail.errMsg != 'getPhoneNumber:ok') {
			return;
		}

		wx.login({
			success: (respond: any) => {
				if (respond.errMsg == 'login:ok') {
					wx.showLoading({ title: '登录中', mask: true });
					smc.net
						.data({
							code: respond.code,
							deptId: this.deptId
						})
						.post('prod-api/api/mini/guardian/getWechatOpenid')
						.then((response: any) => {
							wx.hideLoading();
							if (response.code == 209) {
								smc.account.deptId = 'undefined';
								wx.showToast({
									title: '登录信息失效，请重新扫描门店二维码',
									icon: 'none',
									mask: true
								});
								return;
							}

							if (response.code !== 200 || !response.data) {
								wx.showToast({
									title: response.msg,
									icon: 'none',
									mask: true
								});
								return;
							}

							const params = {
								code: event.detail.code,
								openid: response.data,
								deptId: this.deptId,
								cancelLogin
							};

							this.connect(params).then((res) => {
								if (onFinish) {
									onFinish(res);
								} else {
									wx.showToast({
										title: '登录成功',
										icon: 'none'
									});
								}
							});
						});
				}
			}
		});
	}
}
