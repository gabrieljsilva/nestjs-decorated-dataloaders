type PathDepth = 3;
type Join<K, P> = K extends string | number ? (P extends string | number ? `${K}.${P}` : never) : never;
type NonFunctionKeys<T> = {
	[K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * create a string union of all possible paths in an object, including nested objects and arrays;
 * PS: Typescript has a limited amount of recursion, so the depth is limited to 3 by default
 * it can be increased by changing the PathDepth type, but it will increase the compilation time
 */

export type Paths<T, Depth extends number = PathDepth> = [Depth] extends [never]
	? never
	: T extends object
		? {
				[K in NonFunctionKeys<T>]: K extends string | number
					? T[K] extends (infer R)[]
						? Join<K, Paths<R, Prev[Depth]>>
						: T[K] extends object
							? Join<K, Paths<T[K], Prev[Depth]>> | K
							: K
					: never;
			}[NonFunctionKeys<T>]
		: "";

type Prev = [never, 0, 1, 2, 3];
