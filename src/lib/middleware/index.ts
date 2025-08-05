// 导出所有中间件
export * from './compose';
export * from './errorHandler';
export * from './validation';
export * from './requestValidator';
export * from './formValidator';
export * from './authValidator';
export * from './rateLimiter';
export * from './logger';

// 常用中间件组合
export const middleware = {
  // 基础组合
  basic: (handler: any) => composeMiddlewares(
    requestLogger(),
    requestValidator(),
    errorHandler(handler)
  ),

  // 登录组合
  login: (handler: any) => composeMiddlewares(
    requestLogger({ logRequestBody: true, sensitiveFields: ['password'] }),
    rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
    requestValidator(),
    formValidator(formSchemas.login),
    errorHandler(handler)
  ),

  // 需要认证的组合
  authenticated: (handler: any) => composeMiddlewares(
    requestLogger(),
    requestValidator(),
    authValidator({ required: true }),
    errorHandler(handler)
  ),

  // 管理员组合
  admin: (handler: any) => composeMiddlewares(
    requestLogger(),
    requestValidator(),
    authValidator({ required: true, roles: ['admin'] }),
    errorHandler(handler)
  ),
};