export default class EntityAttribute {

	constructor(data = {}) {
    this.id = data.id
		this.entityId = data.entityId
		this.key = data.key
		this.value = data.value
	}

}