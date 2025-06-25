/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  /**
   * Create a new ApiError
   * @param statusCode HTTP status code
   * @param errorCode Application-specific error code
   * @param message Error message
   * @param originalError Original error that caused this error
   */
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  
  /**
   * Create an ApiError from an Axios error
   * @param error Axios error
   * @returns ApiError
   */
  static fromAxiosError(error: any): ApiError {
    // Default values
    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    let message = 'An unknown error occurred';
    
    // Extract information from Axios error
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      statusCode = error.response.status;
      
      // Try to extract error details from response
      if (error.response.data && error.response.data.error) {
        errorCode = error.response.data.error.code || errorCode;
        message = error.response.data.error.message || error.message || message;
      } else {
        message = error.message || message;
      }
    } else if (error.request) {
      // Request was made but no response was received
      statusCode = 0;
      errorCode = 'NETWORK_ERROR';
      message = 'Network error: No response received from server';
    } else {
      // Something happened in setting up the request
      message = error.message || message;
    }
    
    return new ApiError(statusCode, errorCode, message, error);
  }
  
  /**
   * Create a not found error
   * @param resourceType Type of resource that was not found
   * @param resourceId ID of the resource that was not found
   * @returns ApiError
   */
  static notFound(resourceType: string, resourceId: string): ApiError {
    return new ApiError(
      404,
      'RESOURCE_NOT_FOUND',
      `${resourceType} with ID ${resourceId} not found`,
      null
    );
  }
  
  /**
   * Create a validation error
   * @param message Validation error message
   * @returns ApiError
   */
  static validation(message: string): ApiError {
    return new ApiError(
      400,
      'VALIDATION_ERROR',
      message,
      null
    );
  }
  
  /**
   * Create an unauthorized error
   * @param message Unauthorized error message
   * @returns ApiError
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(
      401,
      'UNAUTHORIZED',
      message,
      null
    );
  }
}