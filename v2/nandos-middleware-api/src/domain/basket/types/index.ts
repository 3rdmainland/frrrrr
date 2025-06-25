// /domain/basket/types/index.ts

/**
 * Types for the basket domain
 */

export type BasketEvent = 'basketChanged' | 'basketCleared' | 'basketItemAdded' | 'basketItemRemoved' | 'basketItemUpdated';

export interface BasketItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  configuration?: string;
  [key: string]: any;
}

export interface Basket {
  id: string;
  items: BasketItem[];
  total: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  [key: string]: any;
}

// Additional types for order configuration
export interface OrderConfiguration {
  orderType: string;
  storeId?: string;
  fulfillmentType?: string;
  orderTime?: number;
  address?: any;
  customerAddressId?: string;
  tableId?: string;
  kerbsideCollect?: boolean;
  customerVehicle?: any;
  collectionSearchAddress?: string;
  collectionSearchCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Payment-related types
export interface PaymentOptions {
  walletAmount?: number;
  tipAmount?: number;
  creditCard?: any;
  saveCard?: boolean;
  unpaidOrderPaymentIntentId?: string | null;
}

// Voucher type
export interface VoucherData {
  code: string;
  reference: string;
  amount: number;
  [key: string]: any;
}