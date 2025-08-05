import 'dotenv/config';
import { db } from '../lib/db';

async function checkRemoteDatabase() {
  try {
    console.log('=== 检查远程数据库状态 ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // 1. 测试连接
    console.log('\n1. 测试数据库连接...');
    try {
      const result = await db.execute('SELECT 1 as test');
      console.log('✅ 数据库连接正常');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return;
    }
    
    // 2. 检查数据库版本
    console.log('\n2. 检查数据库版本...');
    try {
      const version = await db.execute('SELECT version() as version');
      console.log('数据库版本:', version[0]?.version);
    } catch (error) {
      console.log('版本检查失败:', error.message);
    }
    
    // 3. 检查连接参数
    console.log('\n3. 检查连接参数...');
    try {
      const currentUser = await db.execute('SELECT current_user as user');
      const currentDb = await db.execute('SELECT current_database() as database');
      console.log('当前用户:', currentUser[0]?.user);
      console.log('当前数据库:', currentDb[0]?.database);
    } catch (error) {
      console.log('参数检查失败:', error.message);
    }
    
    // 4. 检查表状态
    console.log('\n4. 检查表状态...');
    try {
      const tables = await db.execute(`
        SELECT table_name, table_rows 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log('表状态:');
      tables.forEach(table => {
        console.log(`  ${table.table_name}: ${table.table_rows || 0} 行`);
      });
    } catch (error) {
      console.log('表状态检查失败:', error.message);
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    process.exit(0);
  }
}

checkRemoteDatabase(); 