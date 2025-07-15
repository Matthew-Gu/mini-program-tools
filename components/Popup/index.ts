const popClass = {
	enter: 'popup-slide-enter',
	enterActive: 'popup-slide-enter-active',
	leaveActive: 'popup-slide-leave-active',
	maskEnter: 'mask-enter',
	maskEnterActive: 'mask-enter-active',
	maskLeaveActive: 'mask-leave-active'
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
			}
		},
		duration: {
			type: Number,
			value: 300
		},
		enableTapMask: {
			type: Boolean,
			value: true
		},
		position: {
			type: String,
			value: 'bottom'
		}
	},
	data: {
		enable: false,
		popupStyle: '',
		popupClass: '',
		maskStyle: ''
	},
	methods: {
		transStyleToString(style: Record<string, any>) {
			if (!style || !Object.keys(style).length) {
				return '';
			}
			const convertedStyle = [];
			for (const [key, value] of Object.entries(style)) {
				if (typeof value === 'string' || typeof value === 'number') {
					const convertedKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
					convertedStyle.push(`${convertedKey}:${value}`);
				} else {
					throw new Error('样式对象的值必须是字符串或者数字');
				}
			}
			return convertedStyle.join(';');
		},
		open() {
			if (this.data.enable) return;
			this.data.enable = true;

			const { duration, position } = this.properties;
			this.setData(
				{
					popupClass: `${position} ${popClass.enter} ${popClass.enterActive}`,
					maskClass: `${popClass.maskEnter} ${popClass.maskEnterActive}`,
					enable: true
				},
				() => {
					setTimeout(() => {
						this.setData({
							popupStyle: this.transStyleToString({
								transitionDuration: duration + 'ms'
							}),
							maskStyle: this.transStyleToString({
								transitionDuration: duration + 'ms'
							}),
							popupClass: `${position}`,
							maskClass: ``
						});
					}, 1000 / 60);
				}
			);
		},
		close(e?: any) {
			const type = e?.type;
			if (type == 'tap' && !this.data.enableTapMask) return;

			if (!this.data.enable) return;
			this.data.enable = false;

			const { duration, position } = this.properties;
			this.setData({
				popupClass: `${position} ${popClass.leaveActive}`,
				maskClass: popClass.maskLeaveActive
			});

			if (duration <= 0) {
				this.transitionEnd();
			}
		},
		transitionEnd() {
			if (this.data.show && this.data.enable) return;
			this.data.enable = false;
			this.setData(
				{
					enable: false,
					popupStyle: '',
					popupClass: '',
					maskStyle: '',
					maskClass: ''
				},
				() => {
					this.triggerEvent('close');
				}
			);
		}
	}
});
