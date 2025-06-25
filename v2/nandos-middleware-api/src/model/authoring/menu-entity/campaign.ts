import '../../../util/admin-context-guard';
import Audience from '../../audience';
import ScheduledEvent from '../../scheduled-event';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { MECHANIC_TYPES, type TMechanicType } from '@nandos-types/model/authoring/menu-entity/campaign';
import { AUDIENCE_TYPES, type TAudienceType } from '@nandos-types/model/audience';
import { type I18NString } from '@nandos-types/model/language';
import { type IBasketDiscount } from '@nandos-types/model/basket';
import { type ICampaign } from '@nandos-types/model/authoring/menu-entity/campaign';


export default class Campaign extends BaseEntity implements ICampaign {

    public schedule: ScheduledEvent;
    public mechanic: TMechanicType;
    public campaignAudienceType: TAudienceType;
    public content: I18NString;
    public audience: Audience;
    public name: I18NString;
    public description: I18NString;
    public lineItemDescription: I18NString;
    public basketDiscount: IBasketDiscount;
    public discountCode: string;
    public freeProductSelectionRequired: boolean;
    public paidOrdersOnly: boolean;

    constructor(data: ICampaign) {
        super(data);

        this.schedule = new ScheduledEvent(data.schedule);
        this.mechanic = MECHANIC_TYPES[data.mechanic];
        this.campaignAudienceType = AUDIENCE_TYPES[data.campaignAudienceType ?? "GENERIC"];
        this.content = data.content ?? {};
        this.audience = new Audience(data.audience);
        this.name = mapI18nValues(data.name);
        this.description = mapI18nValues(data.description);
        this.lineItemDescription = mapI18nValues(data.lineItemDescription);
        this.basketDiscount = data.basketDiscount;
        this.discountCode = data.discountCode;
        this.freeProductSelectionRequired = data.freeProductSelectionRequired ?? false;
        this.paidOrdersOnly = data.paidOrdersOnly;
    }
}