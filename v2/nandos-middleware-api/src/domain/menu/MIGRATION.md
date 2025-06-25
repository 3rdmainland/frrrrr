# Migration Guide: Menu Service

This guide provides instructions for migrating from the legacy `MenuService` to the new domain-driven implementation.

## Overview

The new domain-driven implementation offers several advantages:

- **Separation of concerns**: Each service has a single responsibility
- **Improved testability**: Smaller, focused services with dependency injection
- **Type safety**: Full TypeScript implementation with proper interfaces
- **Vue integration**: Composable hooks for easier integration with Vue components

## Services Comparison

| Legacy Service | New Services |
|----------------|--------------|
| `MenuService.browse()` | `menuQueryService.browse()` |
| `MenuService.search()` | `menuQueryService.search()` |
| `MenuService.getQuickLinks()` | `menuQueryService.getQuickLinks()` |
| `MenuService.retrieveUserProduct()` | `productService.getProduct()` |
| `MenuService.retrieveUserProductFromDefinitionId()` | `productService.getProductByDefinitionId()` |
| `MenuService.registerUserProduct()` | `productService.registerUserProduct()` |
| `MenuService.getRecommendedProducts()` | `recommendationService.getRecommendedProducts()` |
| `MenuService.getRandomProduct()` | `recommendationService.getRandomProduct()` |
| `MenuService.getRandomProducts()` | `recommendationService.getRandomProducts()` |
| `MenuService.getAutoComboMatches()` | `menuUpsellService.getAutoComboMatches()` |
| `MenuService.getUpsells()` | `menuUpsellService.getUpsells()` |
| `MenuService.getProductUpsells()` | `menuUpsellService.getProductUpsells()` |

## Migration Examples

### Example 1: Browsing the Menu

**Legacy code:**

```typescript
import MenuService from 'nandos-middleware-api/src/service/menu/menu-service';

// Assuming you have a concrete implementation of MenuService
const menuService = new ConcreteMenuService();

// Browse the menu
menuService.browse('main')
  .then(menuItem => {
    // Handle menu item
  });
```

**New code:**

```typescript
import { menuQueryService } from 'nandos-middleware-api/src/domain/menu';

// Browse the menu
menuQueryService.browse('main')
  .then(menuItem => {
    // Handle menu item
  });
```

### Example 2: Retrieving a Product

**Legacy code:**

```typescript
import MenuService from 'nandos-middleware-api/src/service/menu/menu-service';

// Assuming you have a concrete implementation of MenuService
const menuService = new ConcreteMenuService();

// Retrieve a product
menuService.retrieveUserProduct('product-123')
  .then(product => {
    // Handle product
  });
```

**New code:**

```typescript
import { productService } from 'nandos-middleware-api/src/domain/menu';

// Retrieve a product
productService.getProduct('product-123')
  .then(product => {
    // Handle product
  });
```

### Example 3: Using Vue Composables

The new implementation provides Vue composable hooks for easier integration with Vue components.

```vue
<script setup>
import { useMenu, useProduct } from 'nandos-middleware-api/src/domain/menu/hooks';

// Browse the menu
const { menuItems, isLoading, error, loadMenu, searchMenu } = useMenu('main');

// Get a product
const { product, isConfigured, price } = useProduct('product-123');
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <ul>
        <li v-for="item in menuItems" :key="item.id">
          {{ item.name }}
        </li>
      </ul>
    </div>

    <div v-if="product">
      <h2>{{ product.name }}</h2>
      <p>Price: {{ price }}</p>
      <p>Configured: {{ isConfigured ? 'Yes' : 'No' }}</p>
    </div>
  </div>
</template>
```

## Gradual Migration

You can use both the legacy and new implementations side by side during migration. The new services are designed to work alongside the existing implementation.


