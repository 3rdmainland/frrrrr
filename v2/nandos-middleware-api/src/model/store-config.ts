import '../util/admin-context-guard';
import { type IStoreConfig } from '@nandos-types/model/store';

export default class StoreConfig {
	private id: string;
	private preset: boolean;
	private base: boolean;
	private name: string;
	private collectionBuffer: number;
	private deliveryBuffer: number;
	private maxPerSlot: number;
	private prepTime: number;
	private slotSize: number;
	private orderPriceThreshold: number;
	private orderPriceIncrement: number;
	private orderPriceTimePerIncrement: number;
	private orderPriceUpperBound: number;
	private deliveryDriverLotteryBuffer: number | null;


	constructor(data: IStoreConfig) {
		this.id = data.id
		this.preset = data.preset || false
		this.base = data.base || false
		this.name = data.name
		this.collectionBuffer = data.collectionBuffer
		this.deliveryBuffer = data.deliveryBuffer
		this.maxPerSlot = data.maxPerSlot
		this.prepTime = data.prepTime
		this.slotSize = data.slotSize
		this.orderPriceThreshold = data.orderPriceThreshold
		this.orderPriceIncrement = data.orderPriceIncrement
		this.orderPriceTimePerIncrement = data.orderPriceTimePerIncrement
		this.orderPriceUpperBound = data.orderPriceUpperBound
		this.deliveryDriverLotteryBuffer = data.deliveryDriverLotteryBuffer
	}
}