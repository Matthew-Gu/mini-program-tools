Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    fixed: {
      type: Boolean,
      value: false,
    },
    bgc: {
      type: String,
      value: "transparent",
      observer: function () {
        this.setStyle();
      },
    },
  },
  data: {
    computedStyle: "",
  },
  lifetimes: {
    attached() {
      this.setStyle();
    },
  },
  methods: {
    setStyle() {
      const { fixed, bgc } = this.properties;
      const { statusBarHeight, navBarHeight } = this.getNavBarInfo();

      let baseStyle: Record<string, string | number> = fixed
        ? {
            position: "fixed",
            top: 0,
            left: 0,
            background: bgc,
            paddingTop: statusBarHeight + "px",
            height: navBarHeight + "px",
          }
        : {
            position: "relative",
            background: bgc,
            paddingTop: statusBarHeight + "px",
            height: navBarHeight + "px",
          };
      this.setData({
        computedStyle: this.transStyleToString(baseStyle),
      });
    },
    transStyleToString(style: Record<string, string | number>) {
      if (!style || !Object.keys(style).length) {
        return "";
      }
      const convertedStyle = [];
      for (const [key, value] of Object.entries(style)) {
        if (typeof value === "string" || typeof value === "number") {
          const convertedKey = key.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`
          );
          convertedStyle.push(`${convertedKey}:${value}`);
        } else {
          throw new Error("样式对象的值必须是字符串或者数字");
        }
      }
      return convertedStyle.join(";");
    },
    getNavBarInfo() {
      // 获取系统信息
      const systemInfo = wx.getWindowInfo();
      // 胶囊按钮位置信息
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = systemInfo.statusBarHeight;
      // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
      const navBarHeight =
        (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 +
        menuButtonInfo.height +
        systemInfo.statusBarHeight;
      const menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
      const menuRight = systemInfo.screenWidth - menuButtonInfo.right;
      const menuHeight = menuButtonInfo.height;

      const navbarInfo = {
        statusBarHeight,
        navBarHeight,
        menuBottom,
        menuRight,
        menuHeight,
      };
      this.triggerEvent("ok", navbarInfo);
      return navbarInfo;
    },
    back() {
      this.triggerEvent("back");
    },
  },
});
