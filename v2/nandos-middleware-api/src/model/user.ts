import { 
  type IUser, 
  type TUserRole, 
  USER_ROLES 
} from "@nandos-types/index";

export default class User implements IUser {
  public email: string;
  public id: string;
  public mobilePhoneNumber?: string;
  public name: string;
  public lastName: string;
  public password?: string;
  public roles: TUserRole[];
  public permissions: string[];
  public stores: any[];
  public lastLogin?: number;
  public adminMobilePhoneNumber?: string;
  public deleted: boolean;

  constructor(data: Partial<IUser> = {}) {
    this.email = data.email || "";
    this.id = data.id || "";
    this.mobilePhoneNumber = data.mobilePhoneNumber;
    this.name = data.name || "";
    this.lastName = data.lastName || "";
    this.password = data.password;
    this.roles = data.roles || [];
    this.permissions = data.permissions || [];
    this.stores = data.stores || [];
    this.lastLogin = data.lastLogin;
    this.adminMobilePhoneNumber = data.adminMobilePhoneNumber;
    this.deleted = !!data.deleted;
  }

  can(type: string): boolean {
    return this.permissions.includes(type);
  }

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }

  get daysSinceLastLogin(): number | null {
    if (!this.lastLogin) return null;
    let timeDifference = Date.now() - this.lastLogin;
    let oneDay = 24 * 60 * 60 * 1000;
    return Math.floor(timeDifference / oneDay);
  }

  get isAdministrator(): boolean {
    return this.roles.includes(USER_ROLES.ADMINISTRATOR);
  }

  get isFinancial(): boolean {
    return this.roles.includes(USER_ROLES.FINANCIAL);
  }

  get isHeadOffice(): boolean {
    return this.roles.includes(USER_ROLES.HEAD_OFFICE);
  }

  get isAreaManager(): boolean {
    return this.roles.includes(USER_ROLES.AREA_MANAGER);
  }

  get isCallCenterAdmin(): boolean {
    return this.roles.includes(USER_ROLES.CALL_CENTER_ADMIN);
  }

  get isCallCenterAgent(): boolean {
    return this.roles.includes(USER_ROLES.CALL_CENTER_AGENT);
  }

  get isStoreOwner(): boolean {
    return this.roles.includes(USER_ROLES.STORE_OWNER);
  }

  get isStoreOwnerCorporate(): boolean {
    return this.roles.includes(USER_ROLES.STORE_OWNER_CORPORATE);
  }

  get isMicrosAdministrator(): boolean {
    return this.roles.includes(USER_ROLES.MICROS_ADMINISTRATOR);
  }

  get isReportViewer(): boolean {
    return this.roles.includes(USER_ROLES.REPORT_VIEWER);
  }

  get isFranchisee(): boolean {
    return this.roles.includes(USER_ROLES.FRANCHISEE);
  }

  get isCustomerDataViewer(): boolean {
    return this.roles.includes(USER_ROLES.CUSTOMER_DATA_VIEWER);
  }

  get isContentEditor(): boolean {
    return this.roles.includes(USER_ROLES.CONTENT_EDITOR);
  }

  get isCredentialsEditor(): boolean {
    return this.roles.includes(USER_ROLES.CREDENTIALS_EDITOR);
  }

  get isDeliveryAdministrator(): boolean {
    return this.roles.includes(USER_ROLES.DELIVERY_ADMINISTRATOR);
  }
}
