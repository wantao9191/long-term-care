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

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

class HttpRequest {
  private config: RequestConfig;
  private baseURL: string;

  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials || true,
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
      
      // 统一响应格式处理
      if (response.ok) {
        return {
          code: data.code || response.status,
          message: data.message || '请求成功',
          data: data.data || data,
          success: true,
        };
      } else {
        return {
          code: data.code || response.status,
          message: data.message || data.error || '请求失败',
          data: null,
          success: false,
        };
      }
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      return {
        code: response.status,
        message: response.ok ? '请求成功' : '请求失败',
        data: text,
        success: response.ok,
      };
    } else {
      // 处理文件下载等二进制数据
      const blob = await response.blob();
      return {
        code: response.status,
        message: response.ok ? '请求成功' : '请求失败',
        data: blob,
        success: response.ok,
      };
    }
  }

  // 错误处理
  private handleError(error: any): ApiResponse {
    console.error('HTTP请求错误:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: -1,
        message: '网络连接失败，请检查网络设置',
        data: null,
        success: false,
      };
    }
    
    if (error.name === 'AbortError') {
      return {
        code: -2,
        message: '请求超时',
        data: null,
        success: false,
      };
    }

    return {
      code: -3,
      message: error.message || '未知错误',
      data: null,
      success: false,
    };
  }

  // 获取token
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  }

  // 设置token
  public setToken(token: string, persistent: boolean = true): void {
    if (typeof window !== 'undefined') {
      if (persistent) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
    }
  }

  // 清除token
  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  }

  // 通用请求方法
  public async request<T = any>(
    url: string,
    options: RequestOptions = {},
    data?: any
  ): Promise<ApiResponse<T>> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    try {
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

      // 请求拦截
      const requestOptions = await this.requestInterceptor(options, data);
      requestOptions.signal = controller.signal;

      // 发送请求
      const response = await fetch(fullURL, requestOptions);
      
      clearTimeout(timeoutId);

      // 响应拦截
      const result = await this.responseInterceptor(response);
      
      // 处理特定状态码
      if (response.status === 401) {
        this.clearToken();
        // 可以在这里触发登录跳转
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      return result;
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
    
    if (response.success && response.data instanceof Blob) {
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }
  }
}

// 创建默认实例
export const http = new HttpRequest();

// 导出类型
export default HttpRequest; 