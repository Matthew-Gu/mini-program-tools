/** 防抖函数 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate = false
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hasCalled = false;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    if (immediate && !hasCalled) {
      fn(...args);
      hasCalled = true;
    } else {
      timer = setTimeout(() => {
        fn(...args);
        hasCalled = false;
      }, delay);
    }
  };
}

/** 节流函数 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 300,
  immediate = false
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (immediate && lastCall === 0) {
      fn(...args);
      lastCall = now;
      return;
    }

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else if (!timer && !immediate) {
      const remaining = delay - (now - lastCall);
      timer = setTimeout(() => {
        timer = null;
        lastCall = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}

// 配置项类型
interface MultiClickOptions {
  count: number; // 触发所需点击次数
  timeout?: number; // 连续点击时，两次点击之间的最大允许间隔（单位：毫秒），默认 300ms
  onTrigger: (event: CustomEvent) => void; // 触发时执行的函数
}

/** 自定义多击 Hook */
export function useMultiClick(options: MultiClickOptions) {
  const { count, timeout = 300, onTrigger } = options;

  let clickCount = 0;
  let lastClickTime = 0;

  function handler(event: CustomEvent) {
    const now = Date.now();
    if (now - lastClickTime > timeout) {
      clickCount = 0;
    }

    clickCount++;
    lastClickTime = now;

    if (clickCount === count) {
      onTrigger(event);
      clickCount = 0; // 重置计数器
    }
  }

  return handler;
}

type PollingFunc = () => Promise<boolean>;

interface UsePollingOptions {
  interval?: number; // 轮询间隔，单位毫秒，默认3000
  pollingFunc?: PollingFunc; // 轮询函数，返回是否继续轮询
  onComplete?: () => void; // 轮询完成回调
  maxCount?: number; // 最大轮询次数，默认无限
}

interface UsePollingReturn {
  start: () => void;
  stop: () => void;
  setParams: (options: UsePollingOptions) => void;
  isRunning: () => boolean;
  getCount: () => number;
}

/** 创建轮询定时器 */
export function usePolling({
  interval = 3000,
  pollingFunc = async () => false,
  onComplete,
  maxCount,
}: UsePollingOptions = {}): UsePollingReturn {
  let _interval = interval;
  let _pollingFunc = pollingFunc;
  let _onComplete = onComplete;
  let _maxCount = maxCount && maxCount > 0 ? maxCount : Infinity;

  let _isRunning = false;
  let _timer: number | null = null;
  let _count = 0;

  function setParams({
    interval,
    pollingFunc,
    onComplete,
    maxCount,
  }: UsePollingOptions = {}) {
    if (interval !== undefined && interval > 0) {
      _interval = interval;
    }
    if (pollingFunc) {
      _pollingFunc = pollingFunc;
    }
    if (onComplete) {
      _onComplete = onComplete;
    }
    if (maxCount !== undefined && maxCount > 0) {
      _maxCount = maxCount;
    }
  }

  async function poll() {
    if (!_isRunning) return;

    if (_count >= _maxCount) {
      stop();
      _onComplete?.();
      return;
    }

    _count++;
    const start = Date.now();
    try {
      const shouldContinue = await _pollingFunc();
      const cost = Date.now() - start;
      const delay = Math.max(_interval - cost, 0);

      if (shouldContinue && _count < _maxCount) {
        _timer = setTimeout(poll, delay);
      } else {
        stop();
        _onComplete?.();
      }
    } catch (err) {
      console.error("轮询错误：", err);
      stop();
      _onComplete?.();
    }
  }

  function start() {
    if (_isRunning) return;
    if (typeof _pollingFunc !== "function") {
      throw new Error("pollingFunc 必须是函数");
    }
    _count = 0;
    _isRunning = true;
    poll();
  }

  function stop() {
    if (_timer !== null) {
      clearTimeout(_timer);
      _timer = null;
    }
    _isRunning = false;
  }

  function isRunning() {
    return _isRunning;
  }

  function getCount() {
    return _count;
  }

  return {
    start,
    stop,
    setParams,
    isRunning,
    getCount,
  };
}

/** 创建日历 */
export function createCalendar(
  settings: {
    date?: Date | string;
    firstDay?: number;
    weekend?: number[];
    weekname?: string[];
  } = {}
) {
  const pad = (val: number): string => val.toString().padStart(2, "0");

  const weekdays = (firstDay: number): string[] => {
    const names = config.info.weekname;
    for (let i = 0; i < 8 - firstDay; i++) {
      names.splice(0, 0, names.pop()!);
    }
    return names;
  };

  const render = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numOfDays = new Date(year, month + 1, 0).getDate();
    const isTodayMonth =
      year === config.today.year && month === config.today.month;

    const days: {
      day: number;
      today: boolean;
      datetime: string;
      weekday: number;
      weekend: boolean;
      curMonth: boolean;
    }[] = [];
    const firstDayOffset =
      (new Date(year, month, 1).getDay() - config.info.firstDay + 7) % 7;
    const totalDays = numOfDays + firstDayOffset;
    const remainingDays = (7 - (totalDays % 7)) % 7;

    for (let i = 1 - firstDayOffset; i <= numOfDays + remainingDays; i++) {
      const cur = new Date(year, month, i);
      const dayOfWeek = cur.getDay() || 7;
      days.push({
        day: cur.getDate(),
        today: isTodayMonth && config.today.day === i,
        datetime: `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(
          cur.getDate()
        )}`,
        weekday: dayOfWeek,
        weekend: config.info.weekend.includes(dayOfWeek),
        curMonth: i > 0 && i <= numOfDays,
      });
    }

    return {
      year,
      month: month + 1,
      firstDay: config.info.firstDay,
      weekdays: weekdays(config.info.firstDay),
      days,
    };
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const config = {
    date: settings.date ? new Date(settings.date as any) : undefined,
    today: {
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
    info: {
      firstDay: settings.firstDay || 7,
      weekend: settings.weekend || [6, 7],
      weekname:
        Array.isArray(settings.weekname) && settings.weekname.length === 7
          ? settings.weekname
          : ["一", "二", "三", "四", "五", "六", "日"],
    },
  };

  return render(config.date || today);
}
