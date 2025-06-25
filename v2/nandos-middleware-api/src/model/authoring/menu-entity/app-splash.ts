import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { type IAppSplash } from '@nandos-types/model/authoring/menu-entity/app-splash';

export default class AppSplash extends BaseEntity implements IAppSplash {
	
	public active: boolean;

	constructor(data: IAppSplash) {
		super(data);
    	this.active = !!data.active;
	}
}