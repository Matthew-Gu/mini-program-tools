const modalClass = {
  enterActive: "modal-enter-active",
  leaveActive: "modal-leave-active",
  maskEnter: "mask-enter-active",
  maskLeave: "mask-leave-active",
};

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        if (newVal) {
          this.open();
        } else {
          this.close();
        }
      },
    },
  },
  data: {
    maskShowClass: false,
    maskShow: false,
    modalShowClass: false,
    modalShow: false,
    modalClass: "",
    maskClass: "",
    isClosing: false,
  },
  methods: {
    open() {
      if (this.data.isClosing) return;
      this.setData(
        {
          maskShow: true,
          modalShow: true,
          maskClass: modalClass.maskEnter,
          modalClass: modalClass.enterActive,
        },
        () => {
          setTimeout(() => {
            this.setData({
              maskClass: `maskShow ${modalClass.maskEnter}`,
              modalClass: `modalShow ${modalClass.enterActive}`,
            });
            this.triggerEvent("open");
          }, 1000 / 60);
        }
      );
    },
    close() {
      if (this.data.isClosing) return;
      this.data.isClosing = true;
      this.setData(
        {
          maskClass: modalClass.maskLeave,
          modalClass: modalClass.leaveActive,
        },
        () => {
          setTimeout(() => {
            this.setData({
              maskShow: false,
              modalShow: false,
              maskClass: "",
              modalClass: "",
            });
            this.data.isClosing = false;
            this.triggerEvent("close");
          }, 300);
        }
      );
    },
    confirm(e: any) {
      this.triggerEvent("confirm", e.detail);
    },
  },
});
