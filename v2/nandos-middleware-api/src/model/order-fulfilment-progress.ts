import { 
	type IOrderFulfilmentProgress, 
	type TOrderFulfilmentStatus 
} from "@nandos-types/model/order";

export default class OrderFulfilmentProgress {

	public status: TOrderFulfilmentStatus;
	public deliveryTrackingUrl: string;

	constructor(data: IOrderFulfilmentProgress) {
		this.status = data.status;
		this.deliveryTrackingUrl = data.deliveryTrackingUrl;
	}
}