export class CacheManager {

  private static _instance : CacheManager;

  public static get instance() {
    if (!CacheManager._instance) {
      CacheManager._instance = new CacheManager();
    }

    return CacheManager._instance;
  }

  private constructor() {}

  /** 写入 */
  public set(name : string, value : any) : void {
		wx.setStorageSync(name, value);
  }
  
  /** 获取 */
  public get(name : string, defaultValue : any = null) : any {
		if (!name) {
      return defaultValue;
    }
    
    try {
      let value = wx.getStorageSync(name);
      if (value === "") {
        return defaultValue;
      }
      
      return value;
    } catch (e) {
      return defaultValue;
    }
  }
  
  /** 追加 */
  public push(name : string, value : any) : void {
    let data = this.get(name, []);
    data.push(value);
    this.set(name, data);
  }

  /** 自增 */
  public inc(name : string, step : number = 1) : void {
    let value = this.get(name, 0);
    value += step;
    this.set(name, value);
  }

  /** 自减 */
  public dec(name : string, step : number = 1) : void {
    let value = this.get(name, 0);
    value -= step;
    this.set(name, value);
  }
  
  /** 删除 */
  public delete(name : string) : void {
		wx.removeStorageSync(name);
  }

  /** 清理本地数据缓存 */
  public clear() : void {
    wx.clearStorageSync();
  }

}