// Array insanity: from `{ things: [1,2,3] }` we must produce `things=1&things=2&things=3`
export default function (filters = {}, initialize = false) {
  const queryString = Object.entries(filters)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      let k = encodeURIComponent(key)
      let v = Array.isArray(value) ? value.map(encodeURIComponent).join(`&${k}=`) : encodeURIComponent(value)
      return `${k}=${v}`
    })
    .join('&')
  
  return (initialize && queryString.length > 0) ? `?${queryString}` : queryString
}
