import { type TPrimitive } from "@nandos-types/utils";

export default function (obj: Record<string, TPrimitive | Blob | Array<TPrimitive | Blob>> = {}) {
	const data = new FormData();

	Object.entries(obj)
	  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
	  .forEach(([key, value]) => Array.isArray(value) ? value.forEach(av => data.append(key, av as string)) : data.append(key, value as string));

	return data;
}

