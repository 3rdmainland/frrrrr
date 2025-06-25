const region = process.env.VUE_APP_REGION.toUpperCase()
const additional = process.env.VUE_APP_MAP_ADDITIONAL_SEARCH_COUNTRIES && process.env.VUE_APP_MAP_ADDITIONAL_SEARCH_COUNTRIES.split(',').map(s => s.trim().toUpperCase())

const restrictions = additional == null
  ? [region]
  : [region].concat(additional)

export default restrictions