import '../../../util/admin-context-guard'
import ScheduledEvent from '../../scheduled-event';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { SYSTEM_NOTIFICATION_TYPES, type TSystemNotificationType } from '@nandos-types/model/system';
import type { I18NString } from '@nandos-types/model/language';
import type { ISystemNotification } from '@nandos-types/model/authoring/menu-entity/system-notification';

export default class SystemNotification extends BaseEntity implements ISystemNotification {

	public type: TSystemNotificationType;
	public schedule: ScheduledEvent;
	public name: I18NString;
	public description: I18NString;
	public link: I18NString;
	public linkText: I18NString;
	public youtubeId: I18NString;
	public displayOrder: number;

	constructor(data: ISystemNotification) {
		super(data);
    	this.type = SYSTEM_NOTIFICATION_TYPES[data.type];
		this.schedule = new ScheduledEvent(data.schedule);
		this.name = mapI18nValues(data.name);
		this.description = mapI18nValues(data.description);
		this.link = mapI18nValues(data.link);
		this.linkText = mapI18nValues(data.linkText);
		this.youtubeId = mapI18nValues(data.youtubeId);
		this.displayOrder = data.displayOrder;
	}

	get linkIsExternal() {
		return Object.entries(this.link)
			.reduce((acc: Record<string, boolean>, [key, val]) => {
				acc[key] = !!val && val.includes('http');
				return acc;
			}, {});
	}
}