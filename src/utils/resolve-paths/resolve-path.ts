import { MapperFN } from "../../types/dataloader.types";

export function resolvePath(entity: any, path: string | MapperFN): any {
	if (!path || !entity) return undefined;

	// If the path is a function, call it with the entity
	if (typeof path === "function") {
		return path(entity);
	}

	// Otherwise, handle the string path as before
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
