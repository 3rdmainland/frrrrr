import '../../util/admin-context-guard'
import { mapI18nValues } from '../../service/admin-language-service'
import { type I18NString } from '@nandos-types/model/language'
import { type IHelpItem } from '@nandos-types/model/authoring'

// These are not imported and used anywhere.
export const GENERAL = 'GENERAL'
export const FOOD = 'FOOD'
export const GIFT_CARD = 'GIFT_CARD'
export const TYPES = [GENERAL, FOOD, GIFT_CARD]

export default class HelpItem implements IHelpItem {

  public id: string;
  public context: I18NString;
  public title: I18NString;
  public content: I18NString;
  public contactFormEnabled: boolean;
  public displayOrder: number;
  
  constructor(data: IHelpItem = {
    id: '',
    context: {},
    title: {},
    content: {},
    contactFormEnabled: false,
    displayOrder: 0
  }) {
    this.id = data.id
    this.context = data.context
    this.title = mapI18nValues(data.title)
    this.content = mapI18nValues(data.content)
    this.contactFormEnabled = data.contactFormEnabled
    this.displayOrder = data.displayOrder
  }
}