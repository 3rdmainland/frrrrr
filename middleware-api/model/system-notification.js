import Promotion from './promotion'

export const TYPES = {
  SYSTEM_NOTICE: 'SYSTEM_NOTICE',
  PERSISTENT_SYSTEM_NOTICE: 'PERSISTENT_SYSTEM_NOTICE',
  SYSTEM_BANNER: 'SYSTEM_BANNER',
  PERSISTENT_SYSTEM_BANNER: 'PERSISTENT_SYSTEM_BANNER',
}

export default class SystemNotification extends Promotion {
  
  constructor(data) {
    super(data)
    this.type = TYPES[data.type]
  }
}