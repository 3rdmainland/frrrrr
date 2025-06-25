import { type IEntityAttribute } from '@nandos-types/model/authoring';

export default class EntityAttribute implements IEntityAttribute {

	public id: string;
	public entityId: string;
	public key: string;
	public value: string;

	constructor(data: IEntityAttribute = {
		id: '',
		entityId: '',
		key: '',
		value: ''
	}) {
   		this.id = data.id;
		this.entityId = data.entityId;
		this.key = data.key;
		this.value = data.value;
	}

}