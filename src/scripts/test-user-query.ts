import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';

async function testUserQuery() {
  try {
    console.log('=== 测试用户查询 ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // 1. 测试基本连接
    console.log('\n1. 测试数据库连接...');
    try {
      const result = await db.execute('SELECT 1 as test');
      console.log('✅ 数据库连接正常');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return;
    }
    
    // 2. 检查users表是否存在
    console.log('\n2. 检查users表是否存在...');
    try {
      const exists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `);
      console.log('users表存在:', exists[0]?.exists);
    } catch (error) {
      console.error('❌ 检查表存在失败:', error.message);
      return;
    }
    
    // 3. 检查users表结构
    console.log('\n3. 检查users表结构...');
    try {
      const columns = await db.execute(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log('users表结构:');
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (error) {
      console.error('❌ 检查表结构失败:', error.message);
    }
    
    // 4. 测试Drizzle ORM查询
    console.log('\n4. 测试Drizzle ORM查询...');
    try {
      const user = await db.select().from(users);
      console.log('✅ Drizzle ORM查询成功');
      console.log('查询结果:', user);
    } catch (error) {
      console.error('❌ Drizzle ORM查询失败:', error.message);
      console.error('错误详情:', error);
      
      // 分析错误类型
      if (error.message.includes('does not exist')) {
        console.log('原因: 表不存在');
      } else if (error.message.includes('column')) {
        console.log('原因: 字段不匹配');
      } else if (error.message.includes('permission')) {
        console.log('原因: 权限不足');
      } else if (error.message.includes('connection')) {
        console.log('原因: 连接问题');
      }
    }
    
    // 5. 测试直接SQL查询
    console.log('\n5. 测试直接SQL查询...');
    try {
      const sqlResult = await db.execute('SELECT * FROM users LIMIT 1');
      console.log('✅ 直接SQL查询成功');
      console.log('SQL查询结果:', sqlResult);
    } catch (error) {
      console.error('❌ 直接SQL查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testUserQuery(); 