import type { APIContext } from 'astro';
import { verifyToken } from '@/lib/utils';
import { log } from '@/lib/utils';

// 用户信息接口
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  permissions?: string[];
}

// 扩展APIContext类型
declare module 'astro' {
  interface APIContext {
    user?: AuthUser;
  }
}

// 中间件结果类型
export interface MiddlewareResult {
  success: boolean;
  response?: Response;
  user?: AuthUser;
}

// 创建错误响应
function createErrorResponse(message: string, status: number = 401): Response {
  return new Response(JSON.stringify({
    code: status,
    message,
    success: false,
    timestamp: new Date().toISOString(),
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 认证中间件 - 直接返回响应结果
export async function authMiddleware(context: APIContext): Promise<MiddlewareResult> {
  const { request } = context;

  try {
    // 获取Authorization头
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log.warn('[认证中间件] 缺少或格式错误的Authorization头', { url: request.url });
      return {
        success: false,
        response: createErrorResponse('缺少或格式错误的Authorization头', 401)
      };
    }

    // 提取token
    const token = authHeader.substring(7);
    if (!token) {
      log.warn('[认证中间件] Token为空', { url: request.url });
      return {
        success: false,
        response: createErrorResponse('Token为空', 401)
      };
    }

    // 验证token
    const payload = verifyToken(token);
    if (!payload) {
      log.warn('[认证中间件] Token验证失败', { url: request.url });
      return {
        success: false,
        response: createErrorResponse('Token验证失败', 401)
      };
    }

    // 设置用户信息
    const user: AuthUser = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    };

    // 设置用户信息到context
    context.user = user;

    log.info('[认证中间件] 用户认证成功', request, {
      userId: payload.id,
      username: payload.username,
    });

    return {
      success: true,
      user
    };
  } catch (error) {
    log.error('[认证中间件] 认证过程发生错误', error);
    return {
      success: false,
      response: createErrorResponse('认证过程发生错误', 500)
    };
  }
}

// 权限检查中间件 - 直接返回响应结果
export function requirePermission(permission: string) {
  return async function (context: APIContext): Promise<MiddlewareResult> {
    // 先进行认证
    const authResult = await authMiddleware(context);
    if (!authResult.success) {
      return authResult;
    }

    // 检查权限
    if (!authResult.user?.permissions?.includes(permission)) {
      log.warn('[权限中间件] 用户权限不足', {
        userId: authResult.user?.id,
        requiredPermission: permission,
        userPermissions: authResult.user?.permissions,
        url: context.request.url
      });
      return {
        success: false,
        response: createErrorResponse(`权限不足，需要权限: ${permission}`, 403)
      };
    }

    return {
      success: true,
      user: authResult.user
    };
  };
}

// 角色检查中间件 - 直接返回响应结果
export function requireRole(role: string) {
  return async function (context: APIContext): Promise<MiddlewareResult> {
    // 先进行认证
    const authResult = await authMiddleware(context);
    if (!authResult.success) {
      return authResult;
    }

    // 检查角色
    if (authResult.user?.role !== role) {
      log.warn('[角色中间件] 用户角色不匹配', {
        userId: authResult.user?.id,
        requiredRole: role,
        userRole: authResult.user?.role,
        url: context.request.url
      });
      return {
        success: false,
        response: createErrorResponse(`角色不匹配，需要角色: ${role}`, 403)
      };
    }

    return {
      success: true,
      user: authResult.user
    };
  };
}

// 管理员权限检查
export const requireAdmin = requireRole('admin');

// 通用权限检查
export const requireAuth = authMiddleware;

// 中间件组合器 - 简化使用
export function withAuth(
  handler: (context: APIContext, user: AuthUser) => Promise<Response>,
  authMiddleware: (context: APIContext) => Promise<MiddlewareResult> = requireAuth
) {
  return async function (context: APIContext): Promise<Response> {
    const result = await authMiddleware(context);

    if (!result.success) {
      return result.response!;
    }

    return await handler(context, result.user!);
  };
}

// 带权限检查的中间件组合器
export function withPermission(
  permission: string,
  handler: (context: APIContext, user: AuthUser) => Promise<Response>
) {
  return withAuth(handler, requirePermission(permission));
}

// 带角色检查的中间件组合器
export function withRole(
  role: string,
  handler: (context: APIContext, user: AuthUser) => Promise<Response>
) {
  return withAuth(handler, requireRole(role));
}