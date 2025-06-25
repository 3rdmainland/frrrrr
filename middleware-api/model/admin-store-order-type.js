import '../util/admin-context-guard'
import StorePingStatus from './store-ping-status'
import AdminStore from './admin-store'
import TimeSet from './time-set'
import { ORDER_TYPES } from './food-basket'

export const ORDER_TYPE_STATUS = {
  MISCONFIGURED: 'MISCONFIGURED',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  DISABLED: 'DISABLED',
}

export default class AdminStoreOrderType {

  constructor(data) {
    this.id = data.id
    this.type = data.orderType
    this.menuId = data.menuId
    this.canBeDisabled = !!data.canBeDisabled
    this.callCenterMaximumOrderValue = data.callCenterMaximumOrderValue
    this.callCenterMinimumOrderValue = data.callCenterMinimumOrderValue
    this.callcentreCapable = data.callcentreCapable
    this.customerCapable = data.customerCapable
    this.forceOffline = data.forceOffline
    this.maximumOrderValue = data.maximumOrderValue
    this.minimumOrderValue = data.minimumOrderValue
    this.oheicsId = data.oheicsId
    this.openingTimes = data.openingTimes && new TimeSet(data.openingTimes)
    this.pingStatus = data.pingStatus && new StorePingStatus(data.pingStatus)
    this.uptime = data.uptime
    this.posProviderRef = data.posProviderRef
  }

  get disabled() {
    return this.forceOffline
  }

  get hasValidConfiguration() {
    return (this.menuId != null) && (this.callcentreCapable == true || this.customerCapable == true) && (this.openingTimes.isValid)
  }

  get online() {
    return this.pingStatus && this.pingStatus.online
  }

  get status() {
    if(this.disabled) return ORDER_TYPE_STATUS.DISABLED
    if(!this.hasValidConfiguration) return ORDER_TYPE_STATUS.MISCONFIGURED
    if(!this.online) return ORDER_TYPE_STATUS.OFFLINE
    return ORDER_TYPE_STATUS.ONLINE
  }

  get statusIcon() {
    return AdminStore.getStatusIcon(this.status)
  }

  get statusColor() {
    return AdminStore.getStatusColor(this.status)
  }
}