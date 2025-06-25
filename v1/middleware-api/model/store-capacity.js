
export const STORE_CAPACITY_STATUS = {
  AVAILABLE: 'AVAILABLE',
};

export default class StoreCapacity {

	constructor(data) {
		this.orderTime = data.orderTime;
		this.expectedTime = data.expectedTime;
    this.storeStatus = data.storeStatus;
    this.canDeliverToLocation = data.canDeliverToLocation;
    this.canKerbsideCollect = data.canKerbsideCollect;
	}

}