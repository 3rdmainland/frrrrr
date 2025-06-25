import { computed, reactive, Ref, watch } from 'vue'
import { Product, Selection } from '../types/product.ts'

export function useProductConfiguration(product: Ref<Product>) {
  const selections = reactive<Record<string, Selection>>({})

  // Watch for product changes and reset selections
  watch(product, () => {
    Object.keys(selections).forEach(key => delete selections[key])
  })

  const isComplete = computed(() => {
    if (!product.value) return false

    const productType = product.value.productType || product.value.getProductType?.()

    if (productType === 'COMBO') {
      return checkComboCompleteness(product.value)
    }

    return checkCompleteness(product.value)
  })

  function checkComboCompleteness(combo: Product): boolean {
    const groups = combo.relatedProducts || combo.getRelatedProducts?.() || []

    // Check COMBO_MAIN groups
    const mainGroups = groups.filter((g: any) =>
      (g.productType || g.getProductType?.()) === 'COMBO_MAIN'
    )

    for (const mainGroup of mainGroups) {
      const mainId = mainGroup.id || mainGroup.getId?.()
      const mainSelection = selections[mainId]

      if (!mainSelection?.value) return false

      // Check nested selections from the SIMPLE product
      if (!mainSelection.nestedSelections) return false

      // Validate nested selections
      const nestedValid = Object.values(mainSelection.nestedSelections).every((sel: any) =>
        !sel.mandatory || sel.valid
      )
      if (!nestedValid) return false
    }

    // Check COMBO_SIDE groups
    const sideGroups = groups.filter((g: any) =>
      (g.productType || g.getProductType?.()) === 'COMBO_SIDE'
    )

    for (const sideGroup of sideGroups) {
      const sideId = sideGroup.id || sideGroup.getId?.()
      const sideSelection = selections[sideId]

      if (!sideSelection?.valid) return false

      const quantity = sideGroup.quantity || 1
      if (!sideSelection.value || sideSelection.value.length !== quantity) return false
    }

    return true
  }

  function checkCompleteness(item: Product): boolean {
    const related = item.relatedProducts || item.getRelatedProducts?.() || []

    // For products with related items, check their selections
    for (const child of related) {
      const childId = child.id || child.getId?.()
      const isMandatory = child.mandatory || child.isMandatory?.()

      if (isMandatory) {
        const selection = selections[childId]
        if (!selection?.valid) return false
      }

      // Recursively check nested items if they have selections
      if (selections[childId] && child.relatedProducts?.length > 0) {
        if (!checkCompleteness(child)) return false
      }
    }

    return true
  }

  const totalPrice = computed(() => {
    //fixme console.log('val',product.value)
    // Get base price - try multiple methods
    let price = 0

    // Try different ways to get the base price
    if (product.value) {
      if (typeof product.value.computePrice === 'function') {
        price = product.value.computePrice() || 0
      } else if (typeof product.value.getPrice === 'function') {
        price = product.value.getPrice() || 0
      } else if (product.value.price !== undefined) {
        price = product.value.price || 0
      }
    }

    //fixme console.log('Base price:', price, 'from product:', product.value)

    // Add selection prices
    Object.entries(selections).forEach(([groupId, selection]) => {
      //fixme console.log(`Selection ${groupId}:`, selection)

      if (selection.price) {
        //fixme console.log(`Adding selection price: ${selection.price}`)
        price += selection.price
      }

      // Add nested selection prices
      if (selection.nestedSelections) {
        Object.entries(selection.nestedSelections).forEach(([nestedId, nestedSel]: [string, any]) => {
          //fixme console.log(`Nested selection ${nestedId}:`, nestedSel)
          if (nestedSel.price) {
            //fixme console.log(`Adding nested price: ${nestedSel.price}`)
            price += nestedSel.price
          }
        })
      }
    })

    //fixme console.log('Total calculated price:', price)
    return price
  })

  function updateSelection(groupId: string, selection: Selection) {
    selections[groupId] = selection
  }

  function getSelection(groupId: string): Selection | undefined {
    return selections[groupId]
  }

  function clearSelections() {
    Object.keys(selections).forEach(key => delete selections[key])
  }

  // Debug helper
  function debugSelections() {
    //fixme console.log('Current selections:', JSON.parse(JSON.stringify(selections)))
    //fixme console.log('Is complete:', isComplete.value)
    //fixme console.log('Total price:', totalPrice.value)
  }

  return {
    selections,
    isComplete,
    totalPrice,
    updateSelection,
    getSelection,
    clearSelections,
    debugSelections
  }
}
