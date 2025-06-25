# Core Module

This module provides core functionality for the Nandos Middleware API.

## Components

### HTTP Client

The `ApiClient` class provides a wrapper around Axios for making HTTP requests.

```typescript
import { ApiClient } from 'nandos-middleware-api/src/core';

// Create a new instance
const apiClient = new ApiClient();

// Make a GET request
apiClient.get<MyResponseType>('/api/endpoint')
  .then(response => {
    // Handle response
  });
```

### Cache Service

The `CacheService` class provides a simple in-memory cache.

```typescript
import { CacheService } from 'nandos-middleware-api/src/core';

// Create a new instance
const cacheService = new CacheService();

// Put a value in the cache
cacheService.put('key', 'value');

// Get a value from the cache
const value = cacheService.get<string>('key');

// Clear a value from the cache
cacheService.clear('key');

// Clear all values matching a pattern
cacheService.clearPattern('prefix:*');
```

### Error Handling

The error handling utilities provide a consistent way to handle errors across the application.

```typescript
import { ApiError, handleError, withErrorHandling, tryCatch } from 'nandos-middleware-api/src/core';

// Create a custom API error
const error = new ApiError(404, 'RESOURCE_NOT_FOUND', 'Resource not found');

// Create a not found error
const notFoundError = ApiError.notFound('User', '123');

// Handle an error
handleError(error);

// Wrap a promise with error handling
const promise = withErrorHandling(fetch('/api/endpoint'));

// Wrap a function with error handling
const safeFunction = tryCatch(() => {
  // Function that might throw an error
});
```

### Observable Base Class

The `Observable` class provides a base class for implementing the observer pattern with TypeScript generics.

```typescript
import { Observable } from 'nandos-middleware-api/src/core';

// Define event types
type MyEvents = 'event1' | 'event2';

// Create a class that extends Observable
class MyClass extends Observable<MyEvents> {
  doSomething() {
    // Notify observers
    this.notifyObservers('event1', 'data');
  }
}

// Create an observer
const observer = {
  notify: (event: MyEvents, data: any) => {
    console.log(`Event: ${event}, Data: ${data}`);
  }
};

// Create an instance
const instance = new MyClass();

// Add observer
instance.addObserver('event1', observer);

// Remove observer
instance.removeObserver('event1', observer);
```

### Vue Composable Hooks

The Vue composable hooks provide reactive access to core functionality.

```typescript
import { useErrorHandler } from 'nandos-middleware-api/src/core';

// In a Vue component
const { error, isError, handleError, resetError, tryExec } = useErrorHandler({
  onError: (err) => {
    console.error('An error occurred:', err);
  }
});

// Try to execute a function with error handling
const fetchData = async () => {
  await tryExec(async () => {
    // Function that might throw an error
  });
};
```

## Usage

Import the components you need from the core module:

```typescript
import { ApiClient, CacheService, ApiError, Observable, useErrorHandler } from 'nandos-middleware-api/src/core';
```