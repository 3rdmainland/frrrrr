# Menu Domain

This directory contains a domain-driven implementation of menu-related functionality for the Nandos Middleware API.

## Structure

The menu domain is organized into the following directories:

- **models/**: Data models representing business entities
- **repositories/**: Data access layer for menu data
- **services/**: Business logic for menu operations
- **types/**: TypeScript type definitions
- **utils/**: Utility functions specific to the menu domain

## Services

### MenuQueryService

Handles menu browsing and searching operations.

```typescript
// Browse a menu category
const category = await menuQueryService.browse('main');

// Search for products
const searchResults = await menuQueryService.search('chicken');

// Get quick links
const quickLinks = await menuQueryService.getQuickLinks();
```

### ProductService

Manages product retrieval and configuration.

```typescript
// Get a product by ID
const product1 = await productService.getProduct('product-123');

// Get a product by definition ID
const product2 = await productService.getProductByDefinitionId('def-456');

// Register a user product
productService.registerUserProduct(userProduct);
```

### RecommendationService

Provides product recommendations based on user behavior.

```typescript
// Get recommended products
const recommendations = await recommendationService.getRecommendedProducts(5);

// Get random products
const randomProducts = await recommendationService.getRandomProducts(3);
```

### MenuUpsellService

Handles upsells and auto-combo matches.

```typescript
// Get upsells for a basket
const upsells = await menuUpsellService.getUpsells(basket);

// Get auto-combo matches
const autoComboMatches = await menuUpsellService.getAutoComboMatches(basket);
```

## Repository

### MenuRepository

Provides data access for menu-related operations.

```typescript
// Get a menu by ID
const menu = await menuRepository.getMenu('menu-123');

// Get promotions
const promotions = await menuRepository.getPromotions();

// Clear cache
menuRepository.clearCache();
```

## Usage

Import the services from the menu domain:

```typescript
import { 
  menuQueryService, 
  productService, 
  recommendationService, 
  menuUpsellService 
} from 'nandos-middleware-api/src/domain/menu';
```


## Compatibility

This domain-driven implementation can be used alongside the existing menu service implementation. It provides a more modular approach to menu-related functionality.
