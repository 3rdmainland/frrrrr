# Nandos Middleware API

> A model & service layer that connects to the Nando's middleware

This package provides a middleware API for connecting Nandos applications to backend services.

## Build Setup

**There is no build**. The components in this package are intended to be used/imported directly by other packages.

## Project Structure

The project is organized using a domain-driven design approach:

```
src/
  core/                 # Core infrastructure
    cache/              # Caching services
    errors/             # Error handling utilities
    hooks/              # Vue composable hooks
    http/               # HTTP client
    utils/              # Utility classes
  domain/               # Domain-specific modules
    menu/               # Menu domain
      hooks/            # Vue composable hooks
      models/           # Data models
      repositories/     # Data access
      services/         # Business logic
      types/            # Type definitions
    basket/             # Basket domain
      hooks/            # Vue composable hooks
      services/         # Business logic
      types/            # Type definitions
    customer/           # Customer domain
      hooks/            # Vue composable hooks
      repositories/     # Data access
      services/         # Business logic
      types/            # Type definitions
    order/              # Order domain
      hooks/            # Vue composable hooks
      repositories/     # Data access
      services/         # Business logic
      types/            # Type definitions
  http/                 # Legacy HTTP client
  model/                # Legacy data models
  service/              # Legacy services
  store/                # Legacy state management
  util/                 # Legacy utilities
```

## Domains

### Menu Domain

The menu domain provides services for browsing and searching the menu, retrieving and configuring products, and getting recommendations and upsells.

```typescript
import { 
  menuQueryService, 
  productService, 
  recommendationService, 
  menuUpsellService,
  menuSelectionService,
  useMenu,
  useProduct
} from 'nandos-middleware-api/src/domain/menu';

// Browse the menu
const category = await menuQueryService.browse('main');

// Search for products
const searchResults = await menuQueryService.search('chicken');

// Get a product
const product = await productService.getProduct('product-123');

// Get recommendations
const recommendations = await recommendationService.getRecommendedProducts(5);

// Get upsells
const upsells = await menuUpsellService.getUpsells(basket);

// Set the selected menu
menuSelectionService.setSelectedMenuId('menu-123');
```

For Vue components, composable hooks are provided:

```vue
<script setup>
import { useMenu, useProduct } from 'nandos-middleware-api/src/domain/menu';

// Browse the menu
const { menuItems, isLoading, error, loadMenu, searchMenu } = useMenu('main');

// Get a product
const { product, isConfigured, price } = useProduct('product-123');
</script>
```

See the [Menu Domain Migration Guide](src/domain/menu/MIGRATION.md) for more information on migrating from the legacy menu service.

### Basket Domain

The basket domain provides services for managing the basket, including adding and removing items.

```typescript
import { basketService } from 'nandos-middleware-api/src/domain/basket';

// Add an item to the basket
basketService.addItem({
  id: 'item-123',
  productId: 'product-123',
  quantity: 1,
  price: 10.99,
  name: 'Chicken'
});

// Get the basket
const basket = basketService.getBasket();
```

For Vue components, a composable hook is provided:

```vue
<script setup>
import { useBasket } from 'nandos-middleware-api/src/domain/basket';
import { useProduct } from 'nandos-middleware-api/src/domain/menu';

const { basket, addProduct, removeItem, isEmpty } = useBasket();
const { product } = useProduct('product-123');

const addToBasket = () => {
  if (product.value) {
    addProduct(product.value);
  }
};
</script>
```

### Customer Domain

The customer domain provides services for managing customer data, including customer information, addresses, credit cards, and preferences.

```typescript
import { meService, selectedCustomerService } from 'nandos-middleware-api/src/domain/customer';

// Get the current customer
const customer = await meService.getMe();

// Update the current customer
await meService.updateCustomer({ name: 'John', lastName: 'Doe' });

// Get customer addresses
const addresses = await meService.getAddresses();

// Add a credit card
const creditCard = await meService.addCreditCard({
  cardType: 'VISA',
  lastFourDigits: '1234',
  expiryMonth: '12',
  expiryYear: '2025',
  nameOnCard: 'John Doe'
});
```

For Vue components, composable hooks are provided:

```vue
<script setup>
import { useCustomer } from 'nandos-middleware-api/src/domain/customer';

const { 
  customer, 
  isLoading, 
  error, 
  updateCustomer, 
  getAddresses 
} = useCustomer();

// Update customer
const updateName = () => {
  updateCustomer({ name: 'John', lastName: 'Doe' });
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="customer">
    <h2>{{ customer.name }} {{ customer.lastName }}</h2>
    <button @click="updateName">Update Name</button>
  </div>
</template>
```

### Order Domain

The order domain provides services for managing orders, including getting orders, tracking orders, and submitting reviews.

```typescript
import { 
  myOrderService, 
  adminOrderService, 
  publicOrderService 
} from 'nandos-middleware-api/src/domain/order';

// Get the current user's orders
const result = await myOrderService.getMyOrders();
const orders = result.orders;

// Get a specific order
const order = await myOrderService.getMyOrder('order-123');

// Get an order pending review
const pendingReview = await myOrderService.getPendingReview();

// Submit a review
await myOrderService.submitReview(
  'order-123',
  'REVIEWED',
  5,
  4,
  'Great food!'
);

// Track an order by token
const trackedOrder = await publicOrderService.getOrderByToken('order-token-123');
```

For Vue components, composable hooks are provided:

```vue
<script setup>
import { useMyOrders, useOrderTracking } from 'nandos-middleware-api/src/domain/order';

// For managing orders
const { 
  orders, 
  pendingReview, 
  loadOrders, 
  submitReview 
} = useMyOrders();

// For tracking orders
const { 
  order, 
  trackOrder, 
  updateKerbsideState 
} = useOrderTracking();

// Track an order
trackOrder('order-token-123');
</script>

<template>
  <div v-if="orders.length > 0">
    <h2>Your Orders</h2>
    <ul>
      <li v-for="order in orders" :key="order.id">
        {{ order.orderNumber }} - {{ order.status }}
      </li>
    </ul>
  </div>

  <div v-if="pendingReview">
    <h2>Please Review Your Order</h2>
    <!-- Review form -->
  </div>
</template>
```

## Core Infrastructure

The core infrastructure provides common functionality used across domains:

```typescript
import { 
  ApiClient, 
  CacheService, 
  ApiError, 
  handleError, 
  Observable,
  useErrorHandler
} from 'nandos-middleware-api/src/core';

// Create an API client
const apiClient = new ApiClient();

// Create a cache service
const cacheService = new CacheService();

// Handle errors
try {
  // Some code that might throw an error
} catch (error) {
  handleError(error);
}

// Use the error handler in a Vue component
const { error, isError, handleError, resetError, tryExec } = useErrorHandler();
```

See the [Core Module Documentation](src/core/README.md) for more information.

## Legacy Services

The legacy services are still available and can be used alongside the new domain-driven implementation:

```typescript
import MenuService from 'nandos-middleware-api/src/service/menu/menu-service';
import BasketService from 'nandos-middleware-api/src/service/basket-service';

// Use legacy services
const menuService = new ConcreteMenuService();
const category = await menuService.browse('main');
```

## Contributing

When adding new functionality, please follow these guidelines:

1. Use the domain-driven design approach
2. Create proper TypeScript types
3. Document your code with JSDoc comments
4. Update the README.md file for the domain
