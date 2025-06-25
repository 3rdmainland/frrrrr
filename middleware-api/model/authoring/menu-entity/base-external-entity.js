import '../../../util/admin-context-guard'

export const TYPES = {
  EXTERNAL_PRODUCT: 'EXTERNAL_PRODUCT',
  EXTERNAL_CHECKOUT_INSTRUCTION: 'EXTERNAL_CHECKOUT_INSTRUCTION',
  EXTERNAL_STORE: 'EXTERNAL_STORE',
  EXTERNAL_FREE_PRODUCT: 'EXTERNAL_FREE_PRODUCT',
}

export default class BaseExternalEntity {

	constructor(data) {
		this.id = data.id
		this.entityType = data.entityType
		this.name = data.name
		this.description = data.description
		this.isExternal = true
	}

	get displayName() {
		return this.name
	}

	static parseEntity(entity) {
		switch(entity.entityType) {
		  /*case TYPES.EXTERNAL_PRODUCT: return new Product(entity)
		  case TYPES.EXTERNAL_CHECKOUT_INSTRUCTION: return new CheckoutInstruction(entity)
		  case TYPES.EXTERNAL_FREE_PRODUCT: return new Product(entity)
		  case TYPES.EXTERNAL_STORE: return new Store(entity)*/
		  default: return new BaseExternalEntity(entity)
		}
	}

}
