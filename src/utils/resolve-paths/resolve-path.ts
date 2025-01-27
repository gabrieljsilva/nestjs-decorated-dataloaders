export function resolvePath(entity: any, path: string): any {
	if (!path || !entity) return undefined;

	let current = entity;
	const parts: string[] = path.split(".");

	for (const part of parts) {
		if (Array.isArray(current)) {
			const results = current.map((item) => item?.[part]).filter((value) => value !== undefined);
			if (!results.length) {
				return undefined;
			}
			current = results;
		} else {
			if (current === undefined) {
				return undefined;
			}
			current = current[part];
		}
	}

	return current;
}
