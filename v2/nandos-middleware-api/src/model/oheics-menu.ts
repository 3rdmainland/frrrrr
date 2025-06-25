import '../util/admin-context-guard';
import { type TOrderType } from '@nandos-types/model/order';
import { type IOheicsMenu, type TDietaryType } from '@nandos-types/model/oheics-menu';

export default class OheicsMenu {

	public id: string;
	public name: string;
	public oheicsId: string;
	public posProviderRef: string;
	public baseMenu: boolean;
	public orderType: TOrderType;
	public menuTemplateId: string;
	public dietaryType: TDietaryType;

	constructor(data: IOheicsMenu) {
		this.id = data.id;
		this.name = data.name;
		this.oheicsId = data.oheicsId;
		this.posProviderRef = data.posProviderRef;
		this.baseMenu = data.baseMenu;
		this.orderType = data.orderType;
		this.menuTemplateId = data.menuTemplateId;
		this.dietaryType = data.dietaryType;
	}

}