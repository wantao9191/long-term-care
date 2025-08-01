import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 创建数据库连接
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  ssl: false, // 本地连接不需要SSL
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });