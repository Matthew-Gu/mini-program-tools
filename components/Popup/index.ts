const popClass = {
  enter: "popup-slide-enter",
  enterActive: "popup-slide-enter-active",
  leaveActive: "popup-slide-leave-active",
  maskEnter: "mask-enter-active",
  maskLeave: "mask-leave-active",
};

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        if (this.data.maskShow == newVal) return;
        if (newVal) {
          this.open();
        } else {
          this.close({});
        }
      },
    },
    height: {
      type: String,
      value: "30%",
    },
    duration: {
      type: Number,
      value: 400,
    },
    enableTapMask: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    maskShow: false,
    popupShow: false,
    popupStyle: "",
    popupClass: "",
    maskStyle: "",
    isClosing: false, // 新增标志
  },
  methods: {
    transStyleToString(style: Record<string, any>) {
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
    open() {
      if (this.data.isClosing) return;
      const { height, duration } = this.properties;
      this.setData(
        {
          popupStyle: this.transStyleToString({
            height: height,
            zIndex: 20,
            transitionDuration: duration + "ms",
          }),
          maskStyle: this.transStyleToString({
            transitionDuration: duration + "ms",
          }),
          popupClass: `${popClass.enter} ${popClass.enterActive}`,
          maskClass: popClass.maskEnter,
          maskShow: true,
          popupShow: true,
        },
        () => {
          setTimeout(() => {
            this.setData({
              popupClass: "",
              maskClass: `maskShow ${popClass.maskEnter}`,
            });
          }, 1000 / 60);
        }
      );
    },
    close(e: any) {
      const type = e.type;
      if (type == "tap" && !this.data.enableTapMask) return;

      if (this.data.isClosing) return;
      this.data.isClosing = true;

      const { height, duration } = this.properties;
      this.setData(
        {
          popupStyle: this.transStyleToString({
            height: height,
            zIndex: 20,
            transitionDuration: duration + "ms",
          }),
          maskStyle: this.transStyleToString({
            transitionDuration: duration + "ms",
          }),
          popupClass: popClass.leaveActive,
          maskClass: popClass.maskLeave,
        },
        () => {
          setTimeout(() => {
            this.setData({
              popupShow: false,
              maskShow: false,
              popupClass: "",
              maskStyle: "",
              maskClass: "",
            });
            this.data.isClosing = false;
            this.triggerEvent("close");
          }, duration);
        }
      );
    },
  },
});
