import '../../util/web-context-guard'
import ProductAvailabilityService from './product-availability-service'

export default new ProductAvailabilityService()

// Re-export base service's constants for convenience 
export * from './product-availability-service'