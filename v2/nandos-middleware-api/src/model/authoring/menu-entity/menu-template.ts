import '../../../util/admin-context-guard';
import { BaseEntity } from './internal'
import { type IMenuTemplate } from '@nandos-types/model/authoring/menu-entity/menu-template';


export default class MenuTemplate extends BaseEntity implements IMenuTemplate {

	public base: boolean;

	constructor(data: IMenuTemplate) {
		super(data);
		this.base = !!data.base;
	}

}