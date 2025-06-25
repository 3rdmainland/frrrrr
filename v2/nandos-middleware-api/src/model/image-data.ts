import { type IImageData } from '@nandos-types/model/image';

export default class ImageData {
	
	public id: string;
	public path: string;
	public name: string;
	public width: number;
	public height: number;
	public contentType: string;
	public file: string;

	constructor(data: IImageData = {
		id: '',
		path: '',
		name: '',
		width: 0,
		height: 0,
		contentType: '',
		file: ""
	}) {
		this.id = data.id;
		this.path = data.path;
		this.name = data.name;
		this.width = data.width;
		this.height = data.height;
		this.contentType = data.contentType;
    	this.file = data.file;
	}

	get isSvg() {
		return this.contentType == 'image/svg+xml';
	}

	get isPortrait () {
		return this.width < this.height;
	}
	
	get isLandscape () {
		return this.width > this.height;
	}
	
	get resolution () {
		return this.width * this.height;
	}

	resize(targetWidth: number, targetHeight: number) {

		if(this.isSvg) return this; // we don't support resizing of SVGs

		const { path, width, height } = ImageData.getSizedImage(this, targetWidth, targetHeight);
		this.path = path;
		this.width = width;
		this.height = height;

		return this;
	}

	static getSizedImage(image: ImageData, width: number, height: number) {
		if(!width || !height || image.isSvg) return image;

		return new ImageData({
			path: `https://imagesrv.nandos.co.za/${width}x${height}/${new URL(image.path).pathname}`,
	    	width,
			height,
			id: image.id,
			contentType: image.contentType,
			file: image.file,
			name: image.name
		});
	}

}