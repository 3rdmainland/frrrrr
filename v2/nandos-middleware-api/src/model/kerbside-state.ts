import { 
  type TKerbsideStatus, 
  type IKerbsideState 
} from '@nandos-types/model/kerbside-state';

export default class KerbsideState {

  public status: TKerbsideStatus;
  public distance: number;
  public acknowledged: boolean;

	constructor(data: IKerbsideState = {
    status: "AWAITING",
    distance: 0,
    acknowledged: false
  }) {
		this.status = data.status
		this.distance = data.distance
		this.acknowledged = data.acknowledged
	}
}