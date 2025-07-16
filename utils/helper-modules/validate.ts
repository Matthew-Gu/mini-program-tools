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

// 提取默认校验器
const defaultValidators = {
	required: (value: any) => value !== '' && value !== null && value !== undefined,
	isPhone: (value: any) => /^1[3-9]\d{9}$/.test(value),
	maxLength: (value: any, param: number) => String(value).length <= param,
	minLength: (value: any, param: number) => String(value).length >= param,
	length: (value: any, param: number) => String(value).length === param,
	max: (value: any, param: number) => Number(value) <= Number(param),
	min: (value: any, param: number) => Number(value) >= Number(param),
	equalTo: <T>(value: any, param: keyof T, all: T) => value === all[param],
	isInteger: (value: any) => Math.floor(Number(value)) === Number(value)
};

export interface ValidationRule<T> {
	validator: keyof typeof defaultValidators | ((value: any, params?: any, all?: T) => boolean);
	message: string;
	params?: any;
}

export type ValidationError = {
	field: string;
	message: string;
};

type ValidationResult = PromiseE<void, ValidationError>;

/** 数据校验器 */
export function validate<T extends Record<string, any>>(
	data: T,
	rules: Record<keyof T, ValidationRule<T>[]>
): ValidationResult {
	for (const [field, validatorsList] of Object.entries(rules)) {
		if (!(field in data)) {
			return Promise.reject({ field, message: `字段 '${field}' 不存在于数据中` });
		}

		const value = data[field as keyof T];

		for (const rule of validatorsList) {
			const { validator, message, params } = rule;
			const fn =
				typeof validator === 'function'
					? validator
					: (defaultValidators[validator] as (value: any, params?: any, all?: T) => boolean);

			if (!fn) {
				return Promise.reject({ field, message: `校验器 '${validator}' 不存在` });
			}

			const result = fn(value, params, data);
			if (!result) {
				return Promise.reject({ field, message });
			}
		}
	}

	return Promise.resolve();
}
