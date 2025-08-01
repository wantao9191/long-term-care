import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// 生成JWT Token
export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// 验证JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}

// 生成随机字符串
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 格式化日期
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 获取客户端IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

// 日志工具函数
export const log = {
  info: (message: string, request: Request, data?: any) => {
    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, {
      ...(data ?? {}),
      method: request.method,
      url: request.url,
      clientIP,
      userAgent: request.headers.get('user-agent')
    });
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, data || '');
  }
}