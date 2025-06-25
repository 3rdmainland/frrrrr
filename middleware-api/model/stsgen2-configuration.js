import '../util/admin-context-guard'

export default class Stsgen2Configuration {
	constructor(data = {}) {
		this.id = data.id
		this.username = data.username || ''
		this.password = data.password || ''
		this.apiKey = data.apiKey || ''
		this.endpointUrl = data.endpointUrl || ''
		this.enableStorePing = data.enableStorePing || false
		this.disablePing = data.disablePing || false
		this.maxRetryCount = data.maxRetryCount || 3
	}
}
