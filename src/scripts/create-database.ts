import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});
async function createDatabase() {
  try {
    console.log('=== 创建数据库 ===',process.env);
    
    // 连接到默认的postgres数据库
    const connectionString = process.env.DATABASE_URL!.replace('/long_term_care', '/postgres');
    console.log('连接字符串:', connectionString);
    
    const client = postgres(connectionString, {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    try {
      console.log('连接到默认数据库...');
      
      // 检查数据库是否已存在
      const exists = await client`
        SELECT 1 FROM pg_database WHERE datname = 'long_term_care'
      `;
      
      if (exists.length > 0) {
        console.log('✅ 数据库 long_term_care 已存在');
      } else {
        console.log('创建数据库 long_term_care...');
        await client`CREATE DATABASE long_term_care`;
        console.log('✅ 数据库创建成功');
      }
      
    } finally {
      await client.end();
    }
    
  } catch (error) {
    console.error('创建数据库失败:', error);
  } finally {
    process.exit(0);
  }
}

createDatabase(); 