/**
 * data:{
 *    name:'',
 *    password:''
 * }
 * rules:{
 *    name:[
 *        {validator:'required',message:'用户名必填'},
 *        {validator:'minLength',message:'用户名至少为两位',params:2}
 *        // 使用内置规则;可校验多个
 *    ],
 *    password:[
 *        {validator:(value)=>!!value,message:'密码必填'}
 *        // 若传自定义规则,优先使用自定义规则
 *    ]
 * }
 *
 * validator.valdate(data,rules)
 * .then(()=>{
 *      // 校验成功，执行后续逻辑
 * }).catch((errors)=>{
 *      // 获取校验失败信息
 * })
 */
class PromiseE<T, E = any> extends Promise<T> {
	constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: E) => void) => void) {
		super(executor);
	}

	then<TResult1 = T, TResult2 = never>(
		onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: E) => TResult2 | PromiseLike<TResult2>) | null | undefined
	): PromiseE<TResult1 | TResult2, E> {
		// 直接调用父类 then，但用 PromiseE 断言类型
		return super.then(onfulfilled, onrejected) as PromiseE<TResult1 | TResult2, E>;
	}

	catch<R = never>(onrejected?: ((reason: E) => R | PromiseLike<R>) | null | undefined): PromiseE<T | R, E> {
		return super.catch(onrejected) as PromiseE<T | R, E>;
	}
}

export class Validator {
	private defaultValidators: Record<string, (value: any, ...params: any[]) => boolean>;

	private static _instance: Validator;

	public static get instance() {
		if (!Validator._instance) {
			Validator._instance = new Validator();
		}

		return Validator._instance;
	}

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

	validate(datas: Record<string, any>, rules: Record<string, ValidatorRule[]>): PromiseE<void, ValidationError[]> {
		return new PromiseE((resolve, reject) => {
			const errors: ValidationError[] = [];

			const abortEarly = true; // 遇错即停

			for (const [field, validators] of Object.entries(rules)) {
				if (!datas.hasOwnProperty(field)) {
					const err = { field, message: `字段 '${field}' 不存在于数据中` };
					if (abortEarly) return reject([err]);
					errors.push(err);
					continue;
				}

				const value = datas[field];

				for (const rule of validators) {
					const { validator, message, params } = rule;

					const fn = typeof validator === 'function' ? validator : this.defaultValidators[validator];

					if (!fn) {
						const err = { field, message: `校验器 '${validator}' 不存在` };
						if (abortEarly) return reject([err]);
						errors.push(err);
						break;
					}

					const result = fn(value, params, datas);
					if (!result) {
						const err = { field, message };
						if (abortEarly) return reject([err]);
						errors.push(err);
						break; // 同一个字段内，失败就不再继续后续规则
					}
				}
			}

			errors.length ? reject(errors) : resolve();
		});
	}
}

export type ValidatorRule = {
	validator: string | ((value: any, ...params: any[]) => boolean);
	message: string;
	params?: any;
};

type ValidationError = {
	field: string;
	message: string;
};
