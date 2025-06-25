export default function (obj = {}) {
	const data = new FormData()

	Object.entries(obj)
	  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
	  .forEach(([key, value]) => Array.isArray(value) ? value.map(av => data.append(key, av)) : data.append(key, value))

	return data
}
