import { apiConfig } from './config';
import { ApiError } from '@/types/domain';
import { getSecureItem, SECURE_STORE_KEYS } from '@/lib/secure-store';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  timeoutMs?: number;
}

export class HttpClient {
  private onUnauthorizedCallback?: () => void;

  /**
   * Register a listener for 401 Unauthorized responses to trigger automatic logout
   */
  public onUnauthorized(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Main typed request method
   */
  public async request<TData>(endpoint: string, options: RequestOptions = {}): Promise<TData> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      requiresAuth = true,
      timeoutMs = apiConfig.timeoutMs,
    } = options;

    // 1. Build URL with query parameters
    let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${apiConfig.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // 2. Prepare headers
    const requestHeaders: Record<string, string> = {
      ...apiConfig.headers,
      ...headers,
    };

    // 3. Inject Bearer token from SecureStore if required
    // SECURITY RULE: Token is fetched securely on the fly, never logged to console
    if (requiresAuth) {
      try {
        const token = await getSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN);
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        // SecureStore read failure handled silently
      }
    }

    // 4. Setup timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body !== undefined && method !== 'GET') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // 5. Handle HTTP status codes
      if (!response.ok) {
        if (response.status === 401) {
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }

        let errorDetails: Record<string, unknown> = {};
        let errorMessage = `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
        let errorCode = `HTTP_${response.status}`;

        try {
          const errorJson = await response.json();
          if (errorJson && typeof errorJson === 'object') {
            errorMessage = errorJson.message || errorJson.error || errorMessage;
            errorCode = errorJson.code || errorCode;
            errorDetails = errorJson.details || errorJson;
          }
        } catch {
          // If response body is not JSON, use default error message
        }

        const apiError: ApiError = {
          code: errorCode,
          message: errorMessage,
          status: response.status,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        };

        throw apiError;
      }

      // 204 No Content
      if (response.status === 204) {
        return null as unknown as TData;
      }

      const responseData = await response.json();
      return responseData as TData;
    } catch (error: unknown) {
      if ((error as { name?: string }).name === 'AbortError') {
        const timeoutError: ApiError = {
          code: 'TIMEOUT_ERROR',
          message: 'Thời gian kết nối máy chủ quá hạn (timeout). Vui lòng thử lại.',
          status: 408,
          timestamp: new Date().toISOString(),
        };
        throw timeoutError;
      }

      // If already an ApiError, re-throw
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw error as ApiError;
      }

      // Network or unhandled failure
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.',
        details: { originalError: String(error) },
        timestamp: new Date().toISOString(),
      };
      throw networkError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<TData>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TData> {
    return this.request<TData>(endpoint, { ...options, method: 'GET' });
  }

  public post<TData>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TData> {
    return this.request<TData>(endpoint, { ...options, method: 'POST', body });
  }

  public put<TData>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TData> {
    return this.request<TData>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<TData>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TData> {
    return this.request<TData>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<TData>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<TData> {
    return this.request<TData>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new HttpClient();
