import '../util/admin-context-guard'
export default class TaxConfiguration {

	constructor(data = {}) {
		this.id = data.id
    this.name = data.name
    this.effectiveFrom = data.effectiveFrom
    this.rate = data.rate
	}
}