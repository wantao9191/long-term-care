import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, verifyToken, generateRandomString } from "../utils";
export async function login(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username));
  console.log(user,'user');
  // if (!user) {
  //   throw new Error('用户不存在');
  // }
  // const isPasswordValid = await verifyPassword(password, user.password);
  // if (!isPasswordValid) {
  //   throw new Error('密码错误');
  // }
}