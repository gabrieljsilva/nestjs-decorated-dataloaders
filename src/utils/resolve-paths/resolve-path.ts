export function resolvePath(entity: any, path: string) {
	if (!path || !entity) {
		return undefined;
	}

	let current = entity;
	let part = "";

	for (let i = 0; i <= path.length; i++) {
		const char = path[i];

		if (char === "." || i === path.length) {
			if (Array.isArray(current)) {
				const results = [];
				for (const item of current) {
					if (item && item[part] !== undefined) {
						results.push(item[part]);
					}
				}
				current = results.length ? results : undefined;
			} else {
				if (current === undefined) {
					return undefined;
				}
				current = current[part];
			}
			part = "";
		} else {
			part += char;
		}
	}

	return current;
}
