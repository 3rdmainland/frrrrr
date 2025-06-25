import '../../util/admin-context-guard'
import GiftCardDesignPreset from '../gift-card-design-preset'
import { mapI18nValues } from '../../service/admin-language-service'
import { type I18NStringList } from '@nandos-types/model/language';
import { type IGiftCardPreset } from '@nandos-types/model/authoring';

export default class GiftCardPreset {

	public id: string;
	public name: string;
	public prices: number[];
	public messages: I18NStringList;
	public designs: GiftCardDesignPreset[];
	public active: boolean;

	constructor(data: IGiftCardPreset = {
		id: '',
		name: '',
		prices: [],
		messages: {},
		designs: [],
		active: false
	}) {
		this.id = data.id;
		this.name = data.name;
		this.prices = data.prices || [];
		this.messages = mapI18nValues(data.messages);
		this.designs = (data.designs || []).map(d => new GiftCardDesignPreset(d));
		this.active = data.active;
	}
}