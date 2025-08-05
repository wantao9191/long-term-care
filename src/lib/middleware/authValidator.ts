import type { APIContext } from 'astro';
import { log } from '@/lib/utils';
import { ApiErrors } from './errorHandler';
import { verifyToken } from '@/lib/utils';

// Token校验中间件
export function authValidator(options?: {
  required?: boolean; // 是否必须登录
  roles?: string[]; // 允许的角色
  permissions?: string[]; // 需要的权限
}) {
  return async (context: APIContext, next: () => Promise<Response>): Promise<Response> => {
    try {
      const { request, cookies } = context;
      
      // 获取token
      const token = cookies.get('token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '') ||
                   request.headers.get('x-auth-token');

      if (!token) {
        if (options?.required) {
          throw ApiErrors.Unauthorized('请先登录');
        }
        // 如果不需要登录，直接继续
        return await next();
      }

      // 验证token
      let userInfo;
      try {
        userInfo = verifyToken(token);
      } catch (error) {
        if (options?.required) {
          throw ApiErrors.Unauthorized('Token无效或已过期');
        }
        // 如果不需要登录，清除无效token并继续
        cookies.delete('token');
        return await next();
      }

      // 角色校验
      if (options?.roles && options.roles.length > 0) {
        const userRoles = Array.isArray(userInfo.roles) ? userInfo.roles : [userInfo.roles];
        const hasRole = options.roles.some(role => userRoles.includes(role));
        
        if (!hasRole) {
          throw ApiErrors.Forbidden('权限不足，需要特定角色');
        }
      }

      // 权限校验
      if (options?.permissions && options.permissions.length > 0) {
        const userPermissions = userInfo.permissions || [];
        const hasPermission = options.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasPermission) {
          throw ApiErrors.Forbidden('权限不足，需要特定权限');
        }
      }

      // 将用户信息存储到context中
      (context as any).user = userInfo;

      log.info('[Token校验中间件] 用户验证通过', {
        userId: userInfo.id,
        username: userInfo.username,
        roles: userInfo.roles,
        url: request.url
      });

      return await next();
      
    } catch (error) {
      log.error('[Token校验中间件] 用户验证失败', {
        error: error.message,
        url: context.request.url
      });
      throw error;
    }
  };
}

// 权限校验中间件
export function permissionValidator(permissions: string[]) {
  return authValidator({ required: true, permissions });
}

// 角色校验中间件
export function roleValidator(roles: string[]) {
  return authValidator({ required: true, roles });
}

// 管理员校验中间件
export function adminValidator() {
  return authValidator({ required: true, roles: ['admin'] });
} 