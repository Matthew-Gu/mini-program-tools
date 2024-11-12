export class Validator {
    private defaultValidators: Record<string, (value: any, ...params: any[]) => boolean>;

    constructor() {
        this.defaultValidators = {
            required: (value: any) => value !== '' && value !== null && value !== void 0,
            isPhone: (value: string) => /^1[3-9]\d{9}$/.test(value),
            maxLength: (value: string, param: number) => value.length <= param,
            minLength: (value: string, param: number) => value.length >= param,
            length: (value: string, param: number) => value.length === param,
            max: (value: number, param: number) => value <= param,
            min: (value: number, param: number) => value >= param,
            equalTo: (value: any, param: string, allValues: Record<string, string>) => value === allValues[param],
            isInteger: (value: any) => Math.floor(value) == value
        };
    }

    validate(datas: Record<string, any>, rules: Record<string, ValidatorRule[]>): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const errors: ValidationError[] = [];
            const missingFields: string[] = [];

            for (let field of Object.keys(rules)) {
                if (!(field in datas)) {
                    missingFields.push(field);
                }
            }

            for (let field of Object.keys(rules)) {
                if (missingFields.includes(field)) continue;

                for (let rule of rules[field]) {
                    let { validator, message, params } = rule;
                    let result: boolean | undefined;
                    if (typeof validator === 'function') {
                        result = validator(datas[field], params, datas);
                    } else if (this.defaultValidators.hasOwnProperty(validator)) {
                        result = this.defaultValidators[validator](datas[field], params, datas);
                    } else {
                        errors.push({ field, message: `validator '${validator}' is not exist` });
                        break;
                    }
                    if (!result) {
                        errors.push({ field, message });
                        break;
                    }
                }
            }

            missingFields.forEach((field) => {
                errors.push({ field, message: `field ${field} not exist` });
            });

            if (errors.length > 0) {
                reject(errors);
            } else {
                resolve(true); // 校验成功
            }
        });
    }
}

type ValidatorRule = {
    validator: string | ((value: any, ...params: any[]) => boolean);
    message: string;
    params?: any;
};

type ValidationError = {
    field: string;
    message: string;
};

// * example
// let data = {
//     name: '',
//     password: ''
// };
// let rules = {
//     name: [
//         { validator: 'required', message: '用户名必填' },
//         { validator: 'minLength', message: '用户名至少为两位', params: 2 }
//         // 使用内置规则;可校验多个
//     ],
//     password: [
//         { validator: (value: any) => !!value, message: '密码必填' }
//         // 若传自定义规则，优先使用自定义规则
//     ]
// };
// let validator = new Validator();
// validator
//     .validate(data, rules)
//     .then(() => {
//         // 校验成功，执行后续逻辑
//     })
//     .catch((errors) => {
//         // 获取校验失败信息
//         wx.showToast({
//             title: errors[0].message,
//             icon: 'none'
//         });
//     });
