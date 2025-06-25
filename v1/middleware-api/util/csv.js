/**
 * Converts a list of items to a CSV data.
 * `propertyGetters` is an array of functions that should each return a value from the list item passed in 
 * `headers` is an array of strings to be used as column headers in the CSV data
 *
 * Usage:
 *
 * let items = [
 *   {name: 'a', desc: 'lorem...', price: 1250, ... },
 *   {name: 'b', desc: 'lorem...', price: 1250, ... },
 *   {name: 'c', desc: 'lorem...', price: 1250, ... },
 *   {name: 'd', desc: 'lorem...', price: 1250, ... },
 * ]
 * let getters = [
 *   (item) => item.name,
 *   (item) => item.price / 100,
 * ]
 * let headers = ['Title', 'Price']
 *
 * let csvData = csv(items, getters, headers)
 */
export default function (list, propertyGetters, headers) {
	let rows = (list || [])
    .map(item => propertyGetters.map(getter => encodeURIComponent(`"${getter(item)}"`)).join(','))
    .join('\n')

  let headerData = headers.map(header => encodeURIComponent(`"${header}"`)).join(',')

  return `data:text/csv;charset=utf-8,${headerData}\n${rows}`
}