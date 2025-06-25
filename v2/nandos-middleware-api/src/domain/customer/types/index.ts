/**
 * Types for the customer domain
 */

export type CustomerEvent = 'customerChanged' | 'customerUpdated';

export interface CustomerPreferences {
  flavour: string | null;
  [key: string]: any;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  lastName: string;
  mobilePhoneNumber?: string;
  hasPassword: boolean;
  anonymous: boolean;
  verified: boolean;
  birthday?: string;
  loyaltyNumber?: string;
  banned: boolean;
  preferredLanguage?: string;
  preferences: CustomerPreferences;
  marketingOptIn: boolean;
  hasAdminSetMarketingOptIn: boolean;
  roles: string[];
  permissions: string[];
  stores: any[];
  lastLogin?: number;
  adminMobilePhoneNumber?: string;
  deleted: boolean;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  phoneNumber?: string;
  notes?: string;
  default: boolean;
  [key: string]: any;
}

export interface ICustomerCreditCard {
	id: string;
	cardNumber: string;
	expiryMonth: number;
	expiryYear: number;
	cardExpired: boolean;
	tokenExpired: boolean;
};

export interface CustomerBehavior {
  productDefinitionId: string;
  score: number;
  hierarchicalScoreItems?: any[];
  [key: string]: any;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
  createdBy: string;
  type: string;
  [key: string]: any;
}

export interface CustomerPastOrder {
  id: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  orderDate: string;
  total: number;
  status: string;
  items: any[];
  [key: string]: any;
}

export interface CustomerPastGiftCardOrder {
  id: string;
  customerId: string;
  orderNumber: string;
  orderDate: string;
  total: number;
  status: string;
  items: any[];
  [key: string]: any;
}

export type CustomerGiftCardStatus = 'ACTIVE' | 'DEACTIVATED' | 'EXPIRED' | 'REDEEMED';

export interface CustomerGiftCard {
  wiBalance: number;
  wiId: number;
  wiCode: string;
  issuedAmount: number;
  status: CustomerGiftCardStatus;
  createdDate: number;
  expiryDate: number;
  renderedImageUrl: string;
}

export interface CustomerWallet {
  balance: number;
	token: string;
	qrCodeUrl: string;
}