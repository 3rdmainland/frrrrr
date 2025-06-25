import '../util/admin-context-guard'
export default class StorePingStatus {

	constructor(data) {
    this.online = data.online
    this.updated = data.updated
		this.hostAddress = data.hostAddress
		this.oheicsServerName = data.oheicsServerName
	}
}