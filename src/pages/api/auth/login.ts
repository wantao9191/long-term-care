import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { log } from "@/lib/utils";
import { successResponse, errorHandler, ApiErrors } from "@/lib/middleware/errorHandler";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
export const POST: APIRoute = errorHandler(async ({ request, cookies }) => {
  log.info(`[登录] 开始处理请求`, request);
  const { username, password, code } = await request.json();
  const captchaData = cookies.get('captcha')?.value;
  if (!captchaData) {
    throw ApiErrors.BadRequest('验证码已过期')
  }
  const { code: captchaCode, expires } = JSON.parse(captchaData);
  if (Date.now() > expires) {
    throw ApiErrors.BadRequest('验证码已过期')
  }
  if (code !== captchaCode) {
    throw ApiErrors.BadRequest('验证码错误')
  }
  const user = await db.select().from(users).where(eq(users.username, username));
  cookies.delete('captcha');
  log.info(`[登录] 验证码已删除`, request, { username, password });
  return successResponse(null, '登录成功');
})
export const GET: APIRoute = ({ params, request }) => {
  console.log(params)
  return new Response(JSON.stringify({ message: 'Hello World' }), {
    status: 200
  })
}
