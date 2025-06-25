# Order Domain

This directory contains a domain-driven implementation of order-related functionality for the Nandos Middleware API.

## Structure

The order domain is organized into the following directories:

- **repositories/**: Data access layer for order data
- **services/**: Business logic for order operations
- **hooks/**: Vue composable hooks for easier integration with Vue components
- **types/**: TypeScript type definitions

## Services

### OrderService (Base)

Base service that provides common functionality for order operations.

### MyOrderService

Service for managing the current user's orders.

```typescript
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
```

### AdminOrderService

Service for administrative operations on orders.

```typescript
// Get orders with filtering
const result = await adminOrderService.getOrders({ status: 'PLACED' });
const orders = result.orders;

// Get order locations
const locations = await adminOrderService.getOrderLocations({ fromDate: '2023-01-01' });

// Refund an order
await adminOrderService.refundOrder(order, 'Customer requested refund');

// Force an order failure
await adminOrderService.forceFailure(order);
```

### PublicOrderService

Service for public operations on orders, such as tracking orders by token.

```typescript
// Get an order by token
const order = await publicOrderService.getOrderByToken('order-token-123');

// Update kerbside state
await publicOrderService.updateKerbsideState(
  'order-token-123',
  'ARRIVED',
  { latitude: 51.5074, longitude: -0.1278 }
);
```

## Vue Composable Hooks

### useMyOrders

Hook for working with the current user's orders.

```vue
<script setup>
import { useMyOrders } from 'nandos-middleware-api/src/domain/order';

const { 
  orders, 
  isLoading, 
  error, 
  pendingReview,
  loadOrders,
  submitReview 
} = useMyOrders();

// Load orders with filters
loadOrders({ status: 'PLACED' });

// Submit a review
const submitOrderReview = () => {
  submitReview(
    pendingReview.value.id,
    'REVIEWED',
    5,
    4,
    'Great food!'
  );
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h2>Your Orders</h2>
    <ul>
      <li v-for="order in orders" :key="order.id">
        {{ order.orderNumber }} - {{ order.status }}
      </li>
    </ul>
    
    <div v-if="pendingReview">
      <h3>Please Review Your Order</h3>
      <!-- Review form -->
      <button @click="submitOrderReview">Submit Review</button>
    </div>
  </div>
</template>
```

### useOrderTracking

Hook for tracking orders.

```vue
<script setup>
import { useOrderTracking } from 'nandos-middleware-api/src/domain/order';

const { 
  order, 
  isLoading, 
  error, 
  isKerbside,
  kerbsideState,
  trackOrder, 
  updateKerbsideState,
  refreshOrder
} = useOrderTracking();

// Track an order
trackOrder('order-token-123');

// Update kerbside state
const updateKerbside = () => {
  updateKerbsideState('ARRIVED', { latitude: 51.5074, longitude: -0.1278 });
};

// Refresh the order every 30 seconds
setInterval(refreshOrder, 30000);
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="order">
    <h2>Order #{{ order.orderNumber }}</h2>
    <p>Status: {{ order.status }}</p>
    
    <div v-if="isKerbside">
      <h3>Kerbside Collection</h3>
      <p>Status: {{ kerbsideState?.status || 'Not arrived' }}</p>
      <button @click="updateKerbside">I've Arrived</button>
    </div>
  </div>
</template>
```

## Usage

Import the services and hooks from the order domain:

```typescript
import { 
  myOrderService, 
  adminOrderService, 
  publicOrderService,
  useMyOrders,
  useOrderTracking
} from 'nandos-middleware-api/src/domain/order';
```

## Compatibility

This domain-driven implementation can be used alongside the existing order service implementation. It provides a more modular approach to order-related functionality.