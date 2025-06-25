import { ref, onMounted, onUnmounted } from 'vue';
import { addErrorHandler, removeErrorHandler, ApiError } from '../errors';

/**
 * Composable hook for handling errors
 * @param options Options for the error handler
 * @returns Object containing error state and methods for handling errors
 */
export function useErrorHandler(options: {
  onError?: (error: Error | ApiError) => void;
  autoReset?: boolean;
  initialError?: Error | ApiError | null;
} = {}) {
  const {
    onError,
    autoReset = true,
    initialError = null
  } = options;
  
  const error = ref<Error | ApiError | null>(initialError);
  const isError = ref(!!initialError);
  
  /**
   * Handle an error
   * @param err Error to handle
   */
  const handleError = (err: Error | ApiError) => {
    error.value = err;
    isError.value = true;
    
    if (onError) {
      onError(err);
    }
  };
  
  /**
   * Reset the error state
   */
  const resetError = () => {
    error.value = null;
    isError.value = false;
  };
  
  /**
   * Try to execute a function and handle any errors
   * @param fn Function to execute
   * @returns Result of the function
   */
  const tryExec = async <T>(fn: () => Promise<T> | T): Promise<T> => {
    try {
      if (autoReset) {
        resetError();
      }
      
      return await fn();
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  };
  
  // Add global error handler on mount
  onMounted(() => {
    addErrorHandler(handleError);
  });
  
  // Remove global error handler on unmount
  onUnmounted(() => {
    removeErrorHandler(handleError);
  });
  
  return {
    error,
    isError,
    handleError,
    resetError,
    tryExec
  };
}