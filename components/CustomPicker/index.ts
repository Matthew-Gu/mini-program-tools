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
		value: {
			type: Array,
			value: []
		},
		columns: {
			type: Array,
			value: []
		}
	},
	data: {
		enable: false,
		valueChange: [] as any[]
	},
	methods: {
		open() {
			if (this.data.enable) return;
			this.data.enable = true;

			this.setData({
				enable: true,
				valueChange: this.data.value
			});
		},
		close() {
			if (!this.data.enable) return;
			this.data.enable = false;

			this.setData(
				{
					enable: false,
					valueChange: []
				},
				() => {
					this.triggerEvent('close');
				}
			);
		},
		confirm() {
			const { valueChange, columns } = this.data;
			const item = this.getPickerInfoByField(
				'index',
				columns,
				valueChange
			);
			this.triggerEvent('confirm', item);
			this.close();
		},
		onPickerChanged(e: any) {
			this.data.valueChange = e.detail.value;
			const item = this.getPickerInfoByField(
				'index',
				this.data.columns,
				this.data.valueChange
			);
			this.triggerEvent('change', item);
		},
		getPickerInfoByField(
			field: string,
			pickerItems: any[][],
			values: (string | number)[]
		): { name: string; value: any; index?: number }[] {
			const findItem = (
				items: any[],
				value: string | number
			): { name: string; value: any; index?: number } => {
				items = Array.isArray(items) ? items : [items];
				if (field === 'index') {
					return items[value as number] || { name: '', value: '' };
				} else {
					const item = items.find((item) => item[field] === value);
					return item || { name: '', value: '' };
				}
			};

			return values.map((value, i) => {
				let selectedItem = findItem(pickerItems[i], value);

				if (field === 'index') {
					selectedItem.index = parseInt(value as unknown as string);
				} else {
					selectedItem.index = pickerItems[i].findIndex(
						(item) => item === selectedItem
					);
				}

				return selectedItem;
			});
		}
	}
});
