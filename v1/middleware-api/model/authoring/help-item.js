import '../../util/admin-context-guard'
import { mapI18nValues } from '../../service/admin-language-service'

export const GENERAL = 'GENERAL'
export const FOOD = 'FOOD'
export const GIFT_CARD = 'GIFT_CARD'
export const TYPES = [GENERAL, FOOD, GIFT_CARD]

export default class HelpItem {
  
  constructor(data = {}) {
    this.id = data.id
    this.context = data.context
    this.title = mapI18nValues(data.title)
    this.content = mapI18nValues(data.content)
    this.contactFormEnabled = data.contactFormEnabled
    this.displayOrder = data.displayOrder
  }
}