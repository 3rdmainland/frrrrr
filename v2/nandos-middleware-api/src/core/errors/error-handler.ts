import { ApiError } from './api-error';

/**
 * Type for error handler callbacks
 */
export type ErrorHandler = (error: Error | ApiError) => void;

/**
 * Global error handlers
 */
const errorHandlers: ErrorHandler[] = [];

/**
 * Add a global error handler
 * @param handler Error handler function
 */
export function addErrorHandler(handler: ErrorHandler): void {
  errorHandlers.push(handler);
}

/**
 * Remove a global error handler
 * @param handler Error handler function to remove
 */
export function removeErrorHandler(handler: ErrorHandler): void {
  const index = errorHandlers.indexOf(handler);
  if (index !== -1) {
    errorHandlers.splice(index, 1);
  }
}

/**
 * Handle an error by passing it to all registered error handlers
 * @param error Error to handle
 */
export function handleError(error: unknown): void {
  // Convert to ApiError if possible
  const apiError = error instanceof Error 
    ? (error instanceof ApiError ? error : new ApiError(500, 'UNKNOWN_ERROR', error.message, error))
    : new ApiError(500, 'UNKNOWN_ERROR', String(error), error);
  
  // Log the error
  console.error('[API Error]', apiError);
  
  // Call all error handlers
  errorHandlers.forEach(handler => {
    try {
      handler(apiError);
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
    }
  });
}

/**
 * Wrap a promise with error handling
 * @param promise Promise to wrap
 * @returns Promise that handles errors
 */
export function withErrorHandling<T>(promise: Promise<T>): Promise<T> {
  return promise.catch(error => {
    handleError(error);
    throw error;
  });
}

/**
 * Create a try-catch wrapper for a function
 * @param fn Function to wrap
 * @returns Wrapped function that handles errors
 */
export function tryCatch<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);
      
      // If the result is a promise, wrap it with error handling
      if (result instanceof Promise) {
        return withErrorHandling(result) as ReturnType<T>;
      }
      
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
}