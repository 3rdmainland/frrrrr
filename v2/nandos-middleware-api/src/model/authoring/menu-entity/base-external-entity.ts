import '../../../util/admin-context-guard';
import type { TEntityType } from '@nandos-types/model/authoring/menu-entity/entity';
import type { IBaseExternalEntity } from '@nandos-types/model/authoring/menu-entity/base-external-entity';

export default class BaseExternalEntity implements IBaseExternalEntity {

	public id: string;
	public entityType: TEntityType;
	public name: string;
	public description: string;
	public isExternal: boolean;

	constructor(data: IBaseExternalEntity) {
		this.id = data.id;
		this.entityType = data.entityType;
		this.name = data.name;
		this.description = data.description;
		this.isExternal = true;
	}

	get displayName() {
		return this.name;
	}

	static parseEntity(entity: IBaseExternalEntity) {
		return new BaseExternalEntity(entity);
	}

}
