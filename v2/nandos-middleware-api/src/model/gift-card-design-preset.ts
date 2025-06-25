import ImageData from './image-data';
import { type IGiftCardDesignPreset } from '@nandos-types/model/gift-card';

export default class GiftCardDesignPreset {

	public image: ImageData | null;
	public theme: String;

	constructor(data: IGiftCardDesignPreset = {
		image: {
			id: '',
			path: '',
			name: '',
			width: 0,
			height: 0,
			contentType: '',
			file: ''
		},
		theme: ''
	}) {
		this.image = data.image && new ImageData(data.image);
		this.theme = data.theme;
	}
}