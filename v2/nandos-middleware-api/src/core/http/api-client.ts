import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import ApiHttp from "../../http";

/**
 * API client for making HTTP requests
 */
export class ApiClient {
  private axios: AxiosInstance;
  
  constructor(config?: { baseURL?: string }) {
    this.axios = Axios.create({
      baseURL: config?.baseURL || import.meta.env.VITE_API
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptors
    this.axios.interceptors.request.use(config => {
      return config;
    });
    
    // Response interceptors
    this.axios.interceptors.response.use(
      response => response.data,
      error => Promise.reject(error)
    );
  }
  
  /**
   * Make a GET request
   * @param url The URL to request
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Use the existing ApiHttp for now to maintain compatibility
    return ApiHttp.get(url) as Promise<T>;
  }
  
  /**
   * Make a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return ApiHttp.post(url, data) as Promise<T>;
  }
  
  /**
   * Make a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return ApiHttp.put(url, data) as Promise<T>;
  }
  
  /**
   * Make a DELETE request
   * @param url The URL to request
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return ApiHttp.delete(url) as Promise<T>;
  }
}

export default new ApiClient();