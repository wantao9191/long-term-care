import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
// HTTP请求封装类
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 自定义错误类型：用于在请求失败时抛出，包含 code 与后端返回的数据
class HttpError extends Error {
  public code: number
  public data: any

  constructor(message: string, code: number, data?: any) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = data ?? null
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

class HttpRequest {
  private config: RequestConfig;
  private baseURL: string;
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials ?? true,
    };
    this.baseURL = this.config.baseURL!;
  }

  // 请求拦截器
  private async requestInterceptor(options: RequestOptions, data?: any): Promise<RequestInit> {
    // 获取token
    const token = this.getToken();

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
      credentials: options.withCredentials !== false ? 'include' : 'omit',
    };

    // 添加token到请求头
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // 处理请求体
    if (data && ['POST', 'PUT', 'PATCH'].includes(options.method || 'GET')) {
      if (data instanceof FormData) {
        requestOptions.body = data;
        // FormData会自动设置Content-Type，需要删除手动设置的
        const headers = requestOptions.headers as Record<string, string>;
        delete headers['Content-Type'];
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    return requestOptions;
  }

  // 响应拦截器
  private async responseInterceptor(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get('content-type');

    // 处理不同的响应类型
    if (contentType?.includes('application/json')) {
      const data = await response.json();

      // 遵循后端约定：若存在 code，则以 code === 200 判定成功
      if (typeof data?.code === 'number') {
        const isSuccess = data.code === 200;
        if (isSuccess) {
          return {
            code: data.code,
            message: data.message || '请求成功',
            data: data.data ?? null,
            success: true,
          };
        }
        // 业务失败：抛出异常
        throw new HttpError(data.message || '请求失败', data.code, data.data);
      }

      // 无 code 字段时，回退到 HTTP 状态语义
      if (response.ok) {
        return {
          code: response.status,
          message: data?.message || '请求成功',
          data: data?.data ?? data,
          success: true,
        };
      }
      throw new HttpError(data?.message || data?.error || '请求失败', response.status, data?.data ?? data);
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: text,
          success: true,
        };
      }
      throw new HttpError('请求失败', response.status, text);
    } else {
      // 处理文件下载等二进制数据
      const blob = await response.blob();
      if (response.ok) {
        return {
          code: response.status,
          message: '请求成功',
          data: blob,
          success: true,
        };
      }
      throw new HttpError('请求失败', response.status, blob);
    }
  }

  // 错误处理
  private handleError(error: any): never {
    console.error('HTTP请求错误:', error);

    if (error?.name === 'TypeError' && typeof error?.message === 'string' && error.message.includes('fetch')) {
      throw new HttpError('网络连接失败，请检查网络设置', -1);
    }

    if (error?.name === 'AbortError') {
      throw new HttpError('请求超时', -2);
    }

    // 已经是业务 HttpError，直接抛出
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(error?.message || '未知错误', -3);
  }

  // 获取token
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(HttpRequest.ACCESS_TOKEN_KEY) || null
    }
    return null;
  }
  // 异常情况返回登录
  private toLogin() {
    const router = useRouter()
    const pathname = usePathname()
    if (pathname.includes('/admin/login')) {
      return
    }
    router.push(`/admin/login?redirect=${pathname}`)
  }
  // 获取 refresh token
  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(HttpRequest.REFRESH_TOKEN_KEY) || null
    }
    return null;
  }

  // 设置token
  public setToken(token: string, persistent: boolean = true): void {
    if (typeof window !== 'undefined') {
      if (persistent) {
        Cookies.set(HttpRequest.ACCESS_TOKEN_KEY, token)
      } else {
        Cookies.set(HttpRequest.ACCESS_TOKEN_KEY, token)
      }
    }
  }

  // 设置 access/refresh tokens（推荐使用）
  public setTokens(
    tokens: { accessToken: string; refreshToken?: string },
    persistent: boolean = true
  ): void {
    this.setToken(tokens.accessToken, persistent);
    if (typeof window !== 'undefined' && tokens.refreshToken) {
      if (persistent) {
        Cookies.set(HttpRequest.REFRESH_TOKEN_KEY, tokens.refreshToken)
      } else {
        Cookies.set(HttpRequest.REFRESH_TOKEN_KEY, tokens.refreshToken)
      }
    }
  }

  // 清除token
  public clearToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove(HttpRequest.ACCESS_TOKEN_KEY)
      Cookies.remove(HttpRequest.REFRESH_TOKEN_KEY)
    }
  }

  // 使用 refresh token 刷新 access token
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && (data?.data?.accessToken || data?.accessToken)) {
        const accessToken = data.data?.accessToken || data.accessToken;
        this.setToken(accessToken, true);
        return true;
      }
    } catch { }
    return false;
  }

  // 通用请求方法
  public async request<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.requestInternal<T>(url, options, data, false);
  }

  private async requestInternal<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

      const requestOptions = await this.requestInterceptor(options, data);
      requestOptions.signal = controller.signal;

      const response = await fetch(fullURL, requestOptions);
      clearTimeout(timeoutId);

      // 401 处理：尝试刷新一次（基于 HTTP 状态码）
      if (response.status === 401 && !isRetry) {
        const ok = await this.refreshAccessToken();
        if (ok) {
          return this.requestInternal<T>(url, options, data, true);
        }
        // 刷新失败则清理并跳转登录
        this.clearToken();
        if (typeof window !== 'undefined') {
          this.toLogin()
        }
        // 交由下方的响应解析继续抛出错误
      }

      // 若 HTTP 为 200，但后端以业务 code 标识 401（常见于部分网关/后端约定），同样处理刷新与重试
      try {
        const contentType = response.headers.get('content-type');
        if (!isRetry && response.ok && contentType?.includes('application/json')) {
          const cloned = response.clone();
          const body = await cloned.json();
          if (typeof body?.code === 'number' && body.code === 401) {
            const ok = await this.refreshAccessToken();
            if (ok) {
              return this.requestInternal<T>(url, options, data, true);
            }
            this.clearToken();
            if (typeof window !== 'undefined') {
              this.toLogin()
            }
            // 交由下方的响应解析继续抛出错误
          }
        }
      } catch { }

      return this.responseInterceptor(response);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // GET请求
  public async get<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  // POST请求
  public async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST' }, data);
  }

  // PUT请求
  public async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT' }, data);
  }

  // DELETE请求
  public async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // PATCH请求
  public async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH' }, data);
  }

  // 文件上传
  public async upload<T = any>(url: string, file: File, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<T>(url, { ...options, method: 'POST' }, formData);
  }

  // 文件下载
  public async download(url: string, filename?: string, options: RequestOptions = {}): Promise<void> {
    const response = await this.request(url, { ...options, method: 'GET' });

    if (response.data instanceof Blob) {
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return;
    }
    throw new HttpError('下载失败：响应非二进制数据', -4, response.data);
  }
}

// 创建默认实例
export const http = new HttpRequest();

// 导出类型
export default HttpRequest; 