export interface Product {
  id: string
  productType: 'COMBO' | 'SIMPLE' | 'CONDIMENT' | 'COMBO_MAIN' | 'COMBO_SIDE' | 'CONTAINER'
  name: string
  price: number
  mandatory: boolean
  quantity?: number
  halfAndHalfContainer?: boolean
  relatedProducts?: Product[]
  getRelatedProducts?: () => Product[]
  getId?: () => string
  getName?: () => string
  getPrice?: () => number
  isMandatory?: () => boolean
  getProductType?: () => string
}

export interface FlavorSelection {
  flavour1?: string
  flavour2?: string
  halfAndHalf: boolean
}

export interface Selection {
  value: string | string[]
  halfAndHalf?: boolean
  valid: boolean
  price?: number
}
