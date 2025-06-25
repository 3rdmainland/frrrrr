export function normalizeFlavorCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
}

export function findProductById(root: any, id: string): any {
  if (!root) return null

  if ((root.id || root.getId?.()) === id) {
    return root
  }

  const children = root.relatedProducts || root.getRelatedProducts?.() || []
  for (const child of children) {
    const found = findProductById(child, id)
    if (found) return found
  }

  return null
}

export function getProductType(product: any): string {
  return product.productType || product.getProductType?.() || 'UNKNOWN'
}

export function isFlavorGroup(product: any): boolean {
  const name = (product.name || product.getName?.() || '').toLowerCase()
  return ['flavour', 'flavor', 'choose your flavour'].some(keyword =>
    name.includes(keyword)
  )
}

export function hasHalfAndHalfSupport(product: any): boolean {
  const children = product.relatedProducts || product.getRelatedProducts?.() || []
  return children.some((child: any) => {
    const name = (child.name || child.getName?.() || '').toLowerCase()
    return name.includes('half & half') || name.includes('half and half')
  }) || product.halfAndHalfContainer === true
}
