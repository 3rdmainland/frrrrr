import '../../../util/admin-context-guard'
import {BaseEntity, Promotion} from './internal'
import ScheduledEvent from '../../scheduled-event'
import Audience from '../../audience'
import {mapI18nValues} from '../../../service/admin-language-service'

export const MECHANIC_TYPES = {
    FREE_PRODUCT: 'FREE_PRODUCT',
    FREE_DELIVERY: 'FREE_DELIVERY',
    DISCOUNT: 'DISCOUNT',
}

export const AUDIENCE_TYPES = {
    GENERIC: 'GENERIC',
    CUSTOM:"CUSTOM"
}

export const CAMPAIGN_RELATIONSHIP_QUALIFIERS = {
    FREE_PRODUCTS: "freeProducts",
    STORES: "stores",
}

export default class Campaign extends BaseEntity {

    constructor(data) {
        super(data)

        this.schedule = new ScheduledEvent(data.schedule)
        this.mechanic = MECHANIC_TYPES[data.mechanic]
        this.campaignAudienceType = AUDIENCE_TYPES[data.campaignAudienceType ?? "GENERIC"]
        this.content = data.content ?? {}
        this.audience = new Audience(data.audience)
        this.name = mapI18nValues(data.name)
        this.description = mapI18nValues(data.description)
        this.lineItemDescription = mapI18nValues(data.lineItemDescription)
        this.basketDiscount = data.basketDiscount
        this.discountCode = data.discountCode
        this.freeProductSelectionRequired = data.freeProductSelectionRequired ?? false
        this.paidOrdersOnly = data.paidOrdersOnly
    }
}