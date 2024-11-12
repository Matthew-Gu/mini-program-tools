class EventData {
  public event: string = "";
  public listener !: Function;
  public object !: any;
}

export class EventManager {

  private static _instance: EventManager;

  public static get instance() {
    if (!EventManager._instance) {
      EventManager._instance = new EventManager();
    }

    return EventManager._instance;
  }

  private events: Map<string, Array<EventData>> = new Map();

  private constructor() { }

  /** 注册事件 */
  public on(event: string, listener: Function, object?: Object): void {
    if (event == null || !listener) {
      return;
    }

    let events = this.events.get(event);
    if (!events) {
      events = [];
      this.events.set(event, events);
    }

    let data = new EventData();
    data.event = event;
    data.listener = listener;
    data.object = object;
    events?.push(data);
  }

  /** 注册一次事件 */
  public once(event: string, listener: Function, object?: Object) {
    let _listener: any = ($event: string, $args: any) => {
      this.off(event, _listener, object);
      _listener = null;
      listener.call(object, $event, $args);
    }

    this.on(event, _listener, object);
  }

  /** 事件派发 */
  public emit(event: string, args: any = null): void {
    let events = this.events.get(event);
    if (events) {
      events.forEach((data: EventData) => {
        data.listener.call(data.object, event, args);
      });
    }
  }

  /** 注销事件 */
  public off(event: string, listener: Function, object?: Object): void {
    let events = this.events.get(event);
    if (!events) {
      return;
    }

    for (let i = 0; i < events.length; i++) {
      let data: EventData = events[i];
      if (data.listener === listener && data.object == object) {
        events.splice(i, 1);
      }
    }

    if (events.length == 0) {
      this.events.delete(event);
    }
  }

  /** 注销所有事件 */
  public offAll(): void {
    this.events.clear();
  }

  /** 事件是否存在注册 */
  public has(event: string): boolean {
    return this.events.has(event);
  }

}