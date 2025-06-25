// types/menu.types.ts
export interface MenuItem {
  idPath: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  accentColor?:string
  features?: string[]
  available: boolean
  requiresConfiguration?: boolean
  productType?: string
  badge?: MenuItemBadge
  metadata?: Record<string, any>
}

export type MenuItemBadge = 'new' | 'popular' | 'special' | 'promo' | 'combo'

export interface MenuCategory {
  idPath: string
  name: string
  title?: string
  description?: string
  imageUrl?: string
  children?: MenuCategory[]
  items?: MenuItem[]
}

export interface MenuFilterOptions {
  orderType?: string
  storeId?: string
  limit?: number
  filterFn?: (item: any) => boolean
}

export type CacheReason =
  | 'store-changed'
  | 'order-type-changed'
  | 'auth-changed'
  | 'language-changed'
  | 'manual'

export interface CachedData<T> {
  data: T
  timestamp: number
  context?: {
    storeId?: string
    orderType?: string
    userId?: string
  }
}
