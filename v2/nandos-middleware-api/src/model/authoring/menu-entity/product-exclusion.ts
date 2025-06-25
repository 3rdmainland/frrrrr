import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import ScheduledEvent from '../../scheduled-event';
import { type TProductExclusionType } from '@nandos-types/model/product';
import { type IProductExclusion } from '@nandos-types/model/authoring/menu-entity/product-exclusion';

export default class ProductExclusion extends BaseEntity implements IProductExclusion {

	public schedule: ScheduledEvent;
	public type: TProductExclusionType;
	public adminOnly: boolean;

	constructor(data: IProductExclusion) {
		super(data);
		this.schedule = new ScheduledEvent(data.schedule);
		this.type = data.type;
		this.adminOnly = data.adminOnly;
	}
}