import '../../util/admin-context-guard'
import GiftCardDesignPreset from '../gift-card-design-preset'
import { mapI18nValues } from '../../service/admin-language-service'

export default class GiftCardPreset {

	constructor(data = {}) {
		this.id = data.id
		this.name = data.name
		this.prices = data.prices || []
		this.messages = mapI18nValues(data.messages)
		this.designs = (data.designs || []).map(d => new GiftCardDesignPreset(d))
		this.active = data.active
	}
}