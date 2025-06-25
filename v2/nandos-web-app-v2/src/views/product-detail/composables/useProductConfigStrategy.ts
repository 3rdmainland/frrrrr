import { Component } from 'vue'
import FlavorConfigurator from '../components/configurators/FlavorConfigurator.vue'
import OptionSelector from '../components/configurators/OptionSelector.vue'
import ComboSideSelector from '../components/configurators/ComboSideSelector.vue'
import ContainerGroup from '../components/configurators/ContainerGroup.vue'
import ComboMainSelector from '../components/configurators/ComboMainSelector.vue'

export interface ConfigStrategy {
  canHandle(product: any): boolean
  getComponent(): Component
  getProps(product: any, context: any): Record<string, any>
  validateSelection(selection: any): boolean
}

export class FlavorStrategy implements ConfigStrategy {
  canHandle(product: any): boolean {
    const name = product.getName?.()?.toLowerCase() || ''
    return ['flavour', 'flavor', 'choose your flavour'].some(keyword =>
      name.includes(keyword)
    )
  }

  getComponent() {
    return FlavorConfigurator
  }

  getProps(product: any, context: any) {
    const hasHalfAndHalfContainer = product.getRelatedProducts?.()?.some(
      (p: any) => p.getName?.()?.toLowerCase().includes('half & half')
    )

    return {
      supportsHalfAndHalf: hasHalfAndHalfContainer || product.halfAndHalfContainer === true,
      showPeriometer: true
    }
  }

  validateSelection(selection: any): boolean {
    if (selection.halfAndHalf) {
      return selection.flavour1 && selection.flavour2
    }
    return !!selection.flavour1
  }
}

export class ContainerStrategy implements ConfigStrategy {
  canHandle(product: any): boolean {
    return product.productType === 'CONTAINER' ||
      (product.getRelatedProducts?.()?.length > 0 &&
        !new FlavorStrategy().canHandle(product) &&
        !new ComboSideStrategy().canHandle(product))
  }

  getComponent() {
    return ContainerGroup
  }

  getProps(product: any, context: any) {
    return {
      expanded: product.mandatory || false
    }
  }

  validateSelection(selection: any): boolean {
    return true // Validation happens at child level
  }
}

export class OptionStrategy implements ConfigStrategy {
  canHandle(product: any): boolean {
    const type = product.productType || product.getProductType?.()
    return ['CONDIMENT', 'SIMPLE'].includes(type) &&
      product.getRelatedProducts?.()?.length === 0
  }

  getComponent() {
    return OptionSelector
  }

  getProps(product: any, context: any) {
    return {
      multiple: false
    }
  }

  validateSelection(selection: any): boolean {
    return !!selection
  }
}

export class ComboSideStrategy implements ConfigStrategy {
  canHandle(product: any): boolean {
    const type = product.productType || product.getProductType?.()
    return type === 'COMBO_SIDE'
  }

  getComponent() {
    return ComboSideSelector
  }

  getProps(product: any, context: any) {
    return {
      quantity: product.quantity || 1,
      allowedSelections: product.quantity || 1
    }
  }

  validateSelection(selection: any): boolean {
    const quantity = product.quantity || 1
    return Array.isArray(selection) ? selection.length === quantity : false
  }
}

export class ComboMainStrategy implements ConfigStrategy {
  canHandle(product: any): boolean {
    const type = product.productType || product.getProductType?.()
    return type === 'COMBO_MAIN'
  }

  getComponent() {
    return ComboMainSelector
  }

  getProps(product: any, context: any) {
    return {
      autoExpand: true,
      showNestedOptions: true
    }
  }

  validateSelection(selection: any): boolean {
    return selection.valid && selection.nestedSelections
  }
}

export function useProductConfigStrategy() {
  const strategies = [
    new FlavorStrategy(),
    new ComboMainStrategy(),
    new ComboSideStrategy(),
    new ContainerStrategy(),
    new OptionStrategy()
  ]

  function getStrategy(product: any): ConfigStrategy | null {
    return strategies.find(s => s.canHandle(product)) || null
  }

  return { getStrategy }
}
