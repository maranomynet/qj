// Copied from https://github.com/marcelowa/promise-all-properties
// Available via `yarn add promise-all-properties@`

type PlainObj = Record<string, unknown>;

export type PromisesMap<T extends PlainObj> = {
	[P in keyof T]: Promise<T[P]> | T[P];
};

/**
 * Receives an object with promise containing properties and returns a promise that resolves to an object
 * with the same properties containing the resolved values
 * @param  {PromisesMap<T>} promisesMap  the input object with a promise in each property
 * @return {Promise<T>}  a promise that resolved to an object with the same properties containing the resolved values
 */
export default function promiseAllProperties<T extends PlainObj>(
	promisesMap: PromisesMap<T>
): Promise<T> {
	if (
		!(typeof process !== undefined && process.env.NODE_ENV === 'production') &&
		(promisesMap === null ||
			typeof promisesMap !== 'object' ||
			Array.isArray(promisesMap))
	) {
		return Promise.reject(new TypeError('The input argument must be a plain object'));
	}

	try {
		const keys = Object.keys(promisesMap);
		const promises = keys.map((key) => {
			return (promisesMap as any)[key];
		});

		return Promise.all(promises).then((results) => {
			return results.reduce((resolved, result, index) => {
				resolved[keys[index]] = result;
				return resolved;
			}, {});
		});
	} catch (error) {
		return Promise.reject(error);
	}
}
