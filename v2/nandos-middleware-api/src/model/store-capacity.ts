import { 
  type IStoreCapacity, 
  type TStoreCapacityStatus 
} from '@nandos-types/model/store-capacity';

export default class StoreCapacity {

  public orderTime: number;
  public expectedTime: number;
  public storeStatus: TStoreCapacityStatus;
  public canDeliverToLocation: boolean;
  public canKerbsideCollect: boolean;

	constructor(data: IStoreCapacity) {
		this.orderTime = data.orderTime;
		this.expectedTime = data.expectedTime;
    this.storeStatus = data.storeStatus;
    this.canDeliverToLocation = data.canDeliverToLocation;
    this.canKerbsideCollect = data.canKerbsideCollect;
	}

}