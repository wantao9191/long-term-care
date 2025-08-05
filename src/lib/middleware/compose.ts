import type { APIContext, APIRoute } from "astro";
import { errorHandler } from "./errorHandler";

// 中间件类型定义
export type Middleware = (
  context: APIContext, 
  next: () => Promise<Response>
) => Promise<Response>;

// 业务处理器类型
export type Handler = (context: APIContext) => Promise<Response>;

// 中间件组合器
export function composeMiddlewares(
  ...middlewares: (Middleware | Handler)[]
): APIRoute {
  // 创建内部处理器
  const internalHandler = async function handler(context: APIContext): Promise<Response> {
    let index = -1;
    
    // 递归执行中间件
    async function dispatch(i: number): Promise<Response> {
      if (i <= index) {
        throw new Error("next() 被多次调用");
      }
      
      index = i;
      const middleware = middlewares[i];
      
      if (!middleware) {
        throw new Error("没有找到处理器");
      }
      
      // 如果是业务处理器（最后一个），直接执行
      if (i === middlewares.length - 1) {
        return await (middleware as Handler)(context);
      }
      
      // 如果是中间件，执行中间件逻辑
      return await (middleware as Middleware)(context, () => dispatch(i + 1));
    }
    
    return dispatch(0);
  };

  // 用错误处理器包装整个中间件链
  return errorHandler(internalHandler);
}

// 工具函数：将普通函数转换为中间件
export function toMiddleware(handler: Handler): Middleware {
  return async (context: APIContext, next: () => Promise<Response>) => {
    return await handler(context);
  };
}

// 预定义的中间件组合
export const middlewareCompositions = {
  // 基础API组合（请求校验）
  basic: (handler: Handler) => composeMiddlewares(
    require('./requestValidator').requestValidator(),
    handler
  ),

  // 登录接口组合（限流 + 请求校验 + 表单校验）
  login: (handler: Handler) => composeMiddlewares(
    require('./rateLimiter').rateLimiter(require('./rateLimiter').rateLimitConfigs.login),
    require('./requestValidator').requestValidator(),
    require('./formValidator').formValidator(require('./formValidator').formSchemas.login),
    handler
  ),

  // 需要认证的API组合（请求校验 + 认证）
  authenticated: (handler: Handler) => composeMiddlewares(
    require('./requestValidator').requestValidator(),
    require('./authValidator').authValidator({ required: true }),
    handler
  ),

  // 管理员API组合（请求校验 + 管理员认证）
  admin: (handler: Handler) => composeMiddlewares(
    require('./requestValidator').requestValidator(),
    require('./authValidator').adminValidator(),
    handler
  ),

  // 文件上传组合（限流 + 请求校验 + 认证）
  upload: (handler: Handler) => composeMiddlewares(
    require('./rateLimiter').rateLimiter(require('./rateLimiter').rateLimitConfigs.upload),
    require('./requestValidator').requestValidator(),
    require('./authValidator').authValidator({ required: true }),
    handler
  ),
}; 