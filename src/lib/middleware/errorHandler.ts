import type { APIContext } from 'astro';
import { log } from '@/lib/utils';

// 错误响应接口
export interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

// 自定义错误类
export class ApiError extends Error {
  public statusCode: number;
  public code: number;

  constructor(message: string, statusCode: number = 500, code?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || statusCode;
  }
}

// 常见错误
export const ApiErrors = {
  BadRequest: (message: string = '请求参数错误') => new ApiError(message, 400, 400),
  Unauthorized: (message: string = '未授权访问') => new ApiError(message, 401, 401),
  Forbidden: (message: string = '权限不足') => new ApiError(message, 403, 403),
  NotFound: (message: string = '资源不存在') => new ApiError(message, 404, 404),
  Conflict: (message: string = '资源冲突') => new ApiError(message, 409, 409),
  InternalServerError: (message: string = '服务器内部错误') => new ApiError(message, 500, 500),
};

// 错误处理中间件
export function errorHandler(handler: (context: APIContext) => Promise<Response>) {
  return async function(context: APIContext): Promise<Response> {
    try {
      return await handler(context);
    } catch (error) {
      return handleError(error, context);
    }
  };
}

// 错误处理函数
export function handleError(error: any, context: APIContext): Response {
  const { request } = context;
  const timestamp = new Date().toISOString();
  const path = new URL(request.url).pathname;

  let statusCode = 500;
  let code = 500;
  let message = '服务器内部错误';
  let errorDetails = '';

  // 处理不同类型的错误
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof SyntaxError) {
    statusCode = 400;
    code = 400;
    message = '请求格式错误';
    errorDetails = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 400;
    message = '数据验证失败';
    errorDetails = error.message;
  } else {
    errorDetails = error.message || error.toString();
  }

  // 记录错误日志
  log.error('[错误处理] API错误', {
    error: errorDetails,
    statusCode,
    path,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  });

  // 构建错误响应
  const errorResponse: ErrorResponse = {
    code,
    message,
    timestamp,
    path,
  };

  // 开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = errorDetails;
  }

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 成功响应包装器
export function successResponse<T = any>(data: T, message: string = '操作成功'): Response {
  const response = {
    code: 200,
    message,
    data,
    success: true,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}