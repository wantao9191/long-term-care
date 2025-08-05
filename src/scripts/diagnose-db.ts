import 'dotenv/config';
import { db } from '../lib/db';

async function diagnoseDatabase() {
  try {
    console.log('=== 数据库诊断 ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // 1. 测试基本连接
    console.log('\n1. 测试数据库连接...');
    try {
      const result = await db.execute('SELECT 1 as test');
      console.log('✅ 数据库连接成功:', result);
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return;
    }
    
    // 2. 检查数据库是否存在
    console.log('\n2. 检查数据库...');
    try {
      const dbName = await db.execute("SELECT current_database() as db_name");
      console.log('✅ 当前数据库:', dbName[0]?.db_name);
    } catch (error) {
      console.error('❌ 检查数据库失败:', error.message);
    }
    
    // 3. 检查表是否存在
    console.log('\n3. 检查表是否存在...');
    const tables = ['users', 'organizations', 'roles', 'permissions', 'menus'];
    
    for (const tableName of tables) {
      try {
        const exists = await db.execute(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          ) as exists
        `);
        console.log(`${tableName} 表: ${exists[0]?.exists ? '✅ 存在' : '❌ 不存在'}`);
      } catch (error) {
        console.log(`${tableName} 表检查失败: ${error.message}`);
      }
    }
    
    // 4. 检查users表结构
    console.log('\n4. 检查users表结构...');
    try {
      const columns = await db.execute(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log('users表结构:');
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    } catch (error) {
      console.log('users表结构检查失败:', error.message);
    }
    
    // 5. 尝试简单查询
    console.log('\n5. 尝试简单查询...');
    try {
      const count = await db.execute('SELECT COUNT(*) as count FROM users');
      console.log('✅ users表记录数:', count[0]?.count);
    } catch (error) {
      console.error('❌ users表查询失败:', error.message);
      
      // 尝试查看具体错误
      if (error.message.includes('does not exist')) {
        console.log('  原因: users表不存在');
      } else if (error.message.includes('permission denied')) {
        console.log('  原因: 权限不足');
      } else if (error.message.includes('connection')) {
        console.log('  原因: 连接问题');
      }
    }
    
    // 6. 检查外键约束
    console.log('\n6. 检查外键约束...');
    try {
      const constraints = await db.execute(`
        SELECT 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='users'
      `);
      console.log('users表外键约束:', constraints);
    } catch (error) {
      console.log('外键约束检查失败:', error.message);
    }
    
  } catch (error) {
    console.error('诊断失败:', error);
  } finally {
    process.exit(0);
  }
}

diagnoseDatabase(); 