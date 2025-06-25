import '../util/admin-context-guard'

export const DIETARY_TYPES = [
	'STANDARD','KOSHER','HALAL'
]

export default class OheicsMenu {

	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.oheicsId = data.oheicsId
		this.posProviderRef = data.posProviderRef
		this.baseMenu = data.baseMenu
		this.orderType = data.orderType
		this.menuTemplateId = data.menuTemplateId
		this.dietaryType = data.dietaryType
	}

}