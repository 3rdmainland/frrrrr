import ImageData from './image-data'
import { type IImageData } from '@nandos-types/model/image';

export default class ImageCollection {

	private _lazyCollection?: ImageData[];
	private _collection: ImageData[] | null;

	constructor(images: IImageData[] = []) {
		this._lazyCollection = images.map((i) => new ImageData(i));
		this._collection = null;
	}

	get images() {
		if(this._lazyCollection) {
			this._collection = this._lazyCollection.map(image => image instanceof ImageData ? image : new ImageData(image));
			delete this._lazyCollection;
		}
		return this._collection;
	}

	get largest() {
		return this._getLargestImageFromList();
	}

	get largestPortrait() {
		return this._getLargestImageFromList(i => i.isPortrait);
	}

	get largestLandscape() {
		return this._getLargestImageFromList(i => i.isLandscape);
	}

	get isEmpty() {
		return (this._lazyCollection || this._collection || []).length === 0;
	}

	private _getLargestImageFromList(predicate?: (i: ImageData) => boolean) {	
		if (!this.images) return;
		return this.images
			.filter(i => !i.isSvg && (predicate == null || predicate(i))) // we don't compute sizes for SVGs
			.reduce(
				(prev, current) => (prev && prev.resolution > current.resolution) ? prev : current,
				new ImageData()
			);
	}

	createFitImage(renderWidth: number, renderHeight: number) {
		if(this.isEmpty)
			return null
		else if(this.images?.every(image => image.isSvg))
			return this.images[0];

		const candidate = (renderWidth >= renderHeight ? this.largestLandscape : this.largestPortrait) || this.largest;
		if (!candidate) return null;

		const dapening = 0.75;
		const pixelRatio = Math.min(Math.max(1, window.devicePixelRatio * dapening), 3);
		const targetWidth = Math.ceil(renderWidth * pixelRatio);
		const targetHeight = Math.ceil(renderHeight * pixelRatio);

		if((candidate.width <= targetWidth && candidate.height <= targetHeight)) { // Don't bother upscaling an image
			return candidate;
		}
		else {
			return ImageData.getSizedImage(candidate, targetWidth, targetHeight);
		}
	}
}
