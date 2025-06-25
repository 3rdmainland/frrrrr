import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import ScheduledEvent from '../../scheduled-event';
import PackedPromotion from '../../promotion';
import MenuDisplayItem from '../../menu-display-item';
import { type I18NString } from '@nandos-types/model/language';
import { type IImageData } from '@nandos-types/model/image';
import { 
	PROMOTION_RELATIONSHIP_QUALIFIERS,
	type IPromotion
} from '@nandos-types/model/authoring/menu-entity/promotion';


export default class Promotion extends BaseEntity implements IPromotion {

	public name: I18NString;
	public description: I18NString;
	public schedule: ScheduledEvent;
	public link: I18NString;
	public linkText: I18NString;
	public youtubeId: I18NString;
	public accentColor: string;

	constructor(data: IPromotion) {
		super(data);
		this.name = mapI18nValues(data.name);
		this.description = mapI18nValues(data.description);
		this.schedule = new ScheduledEvent(data.schedule);
		this.link = mapI18nValues(data.link);
		this.linkText = mapI18nValues(data.linkText);
		this.youtubeId = mapI18nValues(data.youtubeId);
		this.accentColor = data.accentColor;
	}

	get linkedCampaign() {
		let linkedCampaigns = this.relations && this.relations[PROMOTION_RELATIONSHIP_QUALIFIERS.LINKED_CAMPAIGN]
		return linkedCampaigns  && linkedCampaigns[0] && linkedCampaigns[0].destination;
	}

	/**
	 * @override
	 */
	get scheduleStatus() {
	  return this.linkedCampaign != null
	  	? this.linkedCampaign.scheduleStatus
	  	: super.scheduleStatus;
	}

	/**
	 * @override
	 */
	get nextScheduledOccurrence() {
		return this.linkedCampaign != null
			? this.linkedCampaign.nextScheduledOccurrence
			: super.nextScheduledOccurrence;
	}

	get linkIsExternal() {
		return Object.entries(this.link)
			.reduce((acc, [key, val]) => {
				acc[key] = !!val && val.includes('http');
				return acc
			}, {} as Record<string, boolean>);
	}

	getPreview(lang: string, images: IImageData[]) {
		let data = {
			id: this.id,
			name: this.name && this.name[lang],
			link: this.link && this.link[lang],
			linkText: this.linkText && this.linkText[lang],
			youtubeId: this.youtubeId && this.youtubeId[lang],
			description: this.description && this.description[lang],
			images: images,
			index: 0,
			dateStart:0,
			dateEnd:0,
			accentColor: ''
		}

		return new MenuDisplayItem(new PackedPromotion(data))
	}
}