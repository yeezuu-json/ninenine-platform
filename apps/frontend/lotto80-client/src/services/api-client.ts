/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * HTTP Request Options
 */
export interface RequestOptions<TBody = unknown> {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  body?: TBody;
  signal?: AbortSignal;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<TData> {
  data: TData;
  status: number;
  headers: Headers;
}

/**
 * Custom API Error Class
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Type-safe API Client
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    // Ensure baseUrl ends with / for proper URL construction
    this.baseUrl = config.baseUrl.endsWith('/')
      ? config.baseUrl
      : `${config.baseUrl}/`;
    this.timeout = config.timeout ?? 30000; // 30 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Remove leading slash from endpoint since baseUrl already has trailing slash
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    const url = new URL(cleanEndpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Handle API response
   */
  private async handleResponse<TData>(
    response: Response
  ): Promise<ApiResponse<TData>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown;

      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData;
        } catch {
          // Failed to parse error JSON
        }
      } else {
        try {
          errorMessage = await response.text();
        } catch {
          // Failed to read error text
        }
      }

      throw new ApiClientError(
        errorMessage,
        response.status,
        undefined,
        errorDetails
      );
    }

    let data: TData;

    if (isJson) {
      data = await response.json();
    } else {
      // For non-JSON responses, return as text
      data = (await response.text()) as TData;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * Make HTTP request with timeout
   */
  private async request<TData, TBody = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: RequestOptions<TBody>
  ): Promise<ApiResponse<TData>> {
    const url = this.buildUrl(endpoint, options?.params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        ...this.defaultHeaders,
        ...options?.headers,
      };

      const config: RequestInit = {
        method,
        headers,
        signal: options?.signal || controller.signal,
      };

      if (options?.body && method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      return await this.handleResponse<TData>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError('Request timeout', 408, 'TIMEOUT');
        }
        throw new ApiClientError(error.message, undefined, 'NETWORK_ERROR');
      }

      throw new ApiClientError('Unknown error occurred', undefined, 'UNKNOWN');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  async get<TData>(
    endpoint: string,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<TData, TBody = unknown>(
    endpoint: string,
    options?: RequestOptions<TBody>
  ): Promise<ApiResponse<TData>> {
    return this.request<TData, TBody>('POST', endpoint, options);
  }

  /**
   * PUT request
   */
  async put<TData, TBody = unknown>(
    endpoint: string,
    options?: RequestOptions<TBody>
  ): Promise<ApiResponse<TData>> {
    return this.request<TData, TBody>('PUT', endpoint, options);
  }

  /**
   * PATCH request
   */
  async patch<TData, TBody = unknown>(
    endpoint: string,
    options?: RequestOptions<TBody>
  ): Promise<ApiResponse<TData>> {
    return this.request<TData, TBody>('PATCH', endpoint, options);
  }

  /**
   * DELETE request
   */
  async delete<TData>(
    endpoint: string,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>('DELETE', endpoint, options);
  }

  /**
   * Update base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  /**
   * Update default headers
   */
  setHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.setHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    const { Authorization, ...rest } = this.defaultHeaders;
    this.defaultHeaders = rest;
  }
}

/**
 * Create API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * Default API client instance
 */
export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  timeout: 30000,
});
