export const ADMINISTRATOR = 'ADMINISTRATOR'
export const FINANCIAL = 'FINANCIAL'
export const HEAD_OFFICE = 'HEAD_OFFICE'
export const AREA_MANAGER = 'AREA_MANAGER'
export const CALL_CENTER_ADMIN = 'CALL_CENTER_ADMIN'
export const CALL_CENTER_AGENT = 'CALL_CENTER_AGENT'
export const STORE_OWNER = 'STORE_OWNER'
export const STORE_OWNER_CORPORATE = 'STORE_OWNER_CORPORATE'
export const MICROS_ADMINISTRATOR = 'MICROS_ADMINISTRATOR'
export const REPORT_VIEWER = 'REPORT_VIEWER'
export const FRANCHISEE = 'FRANCHISEE'
export const CUSTOMER_DATA_VIEWER = 'CUSTOMER_DATA_VIEWER'
export const CONTENT_EDITOR = 'CONTENT_EDITOR'
export const CREDENTIALS_EDITOR = 'CREDENTIALS_EDITOR'
export const DELIVERY_ADMINISTRATOR = 'DELIVERY_ADMINISTRATOR'

export const USER_ROLES = [ADMINISTRATOR, FINANCIAL, HEAD_OFFICE, AREA_MANAGER, CALL_CENTER_ADMIN, CALL_CENTER_AGENT, STORE_OWNER, STORE_OWNER_CORPORATE, MICROS_ADMINISTRATOR, REPORT_VIEWER, FRANCHISEE, CUSTOMER_DATA_VIEWER, CONTENT_EDITOR, CREDENTIALS_EDITOR, DELIVERY_ADMINISTRATOR]

export default class User {
  
  constructor (data = {}) {
    this.email = data.email
    this.id = data.id
    this.mobilePhoneNumber = data.mobilePhoneNumber
    this.name = data.name
    this.lastName = data.lastName
    this.password = data.password
    this.roles = data.roles || []
    this.permissions = data.permissions || []
    this.stores = data.stores || []
    this.lastLogin = data.lastLogin
    this.adminMobilePhoneNumber = data.adminMobilePhoneNumber
    this.deleted = !!data.deleted
  }
  
  can (type) {
    return this.permissions.includes(type)
  }
  
  get fullName () {
    return `${this.name} ${this.lastName}`
  }
  
  get daysSinceLastLogin () {
    if (!this.lastLogin) return null
    let timeDifference = Date.now() - this.lastLogin
    let oneDay = 24 * 60 * 60 * 1000
    return Math.floor(timeDifference / oneDay)
  }
  
  get isAdministrator () {
    return this.roles.includes(ADMINISTRATOR)
  }
  
  get isFinancial () {
    return this.roles.includes(FINANCIAL)
  }
  
  get isHeadOffice () {
    return this.roles.includes(HEAD_OFFICE)
  }
  
  get isAreaManager () {
    return this.roles.includes(AREA_MANAGER)
  }
  
  get isCallCenterAdmin () {
    return this.roles.includes(CALL_CENTER_ADMIN)
  }
  
  get isCallCenterAgent () {
    return this.roles.includes(CALL_CENTER_AGENT)
  }
  
  get isStoreOwner () {
    return this.roles.includes(STORE_OWNER)
  }
  
  get isStoreOwnerCorporate () {
    return this.roles.includes(STORE_OWNER_CORPORATE)
  }
  
  get isMicrosAdministrator () {
    return this.roles.includes(MICROS_ADMINISTRATOR)
  }
  
  get isReportViewer () {
    return this.roles.includes(REPORT_VIEWER)
  }
  
  get isFranchisee () {
    return this.roles.includes(FRANCHISEE)
  }
  
  get isCustomerDataViewer () {
    return this.roles.includes(CUSTOMER_DATA_VIEWER)
  }
  
  get isContentEditor () {
    return this.roles.includes(CONTENT_EDITOR)
  }
  
  get isCredentialsEditor () {
    return this.roles.includes(CREDENTIALS_EDITOR)
  }

  get isDeliveryAdministrator(){
    return this.roles.includes(DELIVERY_ADMINISTRATOR)
  }
}