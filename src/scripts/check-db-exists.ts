import 'dotenv/config';
import { db } from '../lib/db';

async function checkDatabaseExists() {
  try {
    console.log('=== 检查数据库是否存在 ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // 1. 尝试连接到默认数据库
    console.log('\n1. 尝试连接到默认数据库...');
    try {
      const defaultDb = await db.execute('SELECT current_database() as db_name');
      console.log('当前数据库:', defaultDb[0]?.db_name);
    } catch (error) {
      console.error('连接失败:', error.message);
      return;
    }
    
    // 2. 检查所有数据库
    console.log('\n2. 检查所有数据库...');
    try {
      const databases = await db.execute(`
        SELECT datname 
        FROM pg_database 
        WHERE datistemplate = false
        ORDER BY datname
      `);
      console.log('所有数据库:');
      databases.forEach(db => {
        console.log(`  ${db.datname}`);
      });
    } catch (error) {
      console.log('检查数据库列表失败:', error.message);
    }
    
    // 3. 检查当前用户权限
    console.log('\n3. 检查用户权限...');
    try {
      const userInfo = await db.execute(`
        SELECT 
          usename,
          usesuper,
          usecreatedb
        FROM pg_user 
        WHERE usename = current_user
      `);
      console.log('用户信息:', userInfo[0]);
    } catch (error) {
      console.log('检查用户权限失败:', error.message);
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabaseExists(); 