import Promotion from './promotion';
import { 
  SYSTEM_NOTIFICATION_TYPES, 
  type TSystemNotificationType, 
  type ISystemNotification 
} from '@nandos-types/model/system';

export default class SystemNotification extends Promotion {

  public type: TSystemNotificationType;

  constructor(data: ISystemNotification) {
    super(data);
    this.type = SYSTEM_NOTIFICATION_TYPES[data.type]
  }
}