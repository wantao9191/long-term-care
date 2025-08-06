import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 创建数据库连接
const connectionString = process.env.DATABASE_URL!;
console.log(connectionString,'------')
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 增加连接池大小
  idle_timeout: 300, // 增加到5分钟
  connect_timeout: 30, // 增加连接超时
  connection: {
    application_name: 'long-term-care-app', // 添加应用名称标识
  },
  // 添加重连机制
  onnotice: (notice) => {
    console.log('数据库通知:', notice);
  },
  onparameter: (param) => {
    console.log('参数变化:', param);
  },
});

export const db = drizzle(client, { schema });