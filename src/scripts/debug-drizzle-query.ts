import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';

async function debugDrizzleQuery() {
  try {
    console.log('=== 调试Drizzle ORM查询 ===');
    
    // 1. 检查schema定义
    console.log('\n1. 检查schema定义...');
    console.log('users表schema字段:');
    console.log('  id:', users.id);
    console.log('  username:', users.username);
    console.log('  password:', users.password);
    console.log('  phone:', users.phone);
    console.log('  name:', users.name);
    console.log('  status:', users.status);
    console.log('  createTime:', users.createTime);
    console.log('  roles:', users.roles);
    console.log('  organizationId:', users.organizationId);
    
    // 2. 检查数据库表结构
    console.log('\n2. 检查数据库表结构...');
    const columns = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('数据库表结构:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // 3. 测试不同的查询方式
    console.log('\n3. 测试不同的查询方式...');
    
    // 3.1 测试部分字段查询
    try {
      console.log('3.1 测试部分字段查询...');
      const partialResult = await db.select({
        id: users.id,
        username: users.username,
        name: users.name
      }).from(users);
      console.log('✅ 部分字段查询成功:', partialResult);
    } catch (error) {
      console.error('❌ 部分字段查询失败:', error.message);
    }
    
    // 3.2 测试单个字段查询
    try {
      console.log('3.2 测试单个字段查询...');
      const singleResult = await db.select({ id: users.id }).from(users);
      console.log('✅ 单个字段查询成功:', singleResult);
    } catch (error) {
      console.error('❌ 单个字段查询失败:', error.message);
    }
    
    // 3.3 测试完整查询
    try {
      console.log('3.3 测试完整查询...');
      const fullResult = await db.select().from(users);
      console.log('✅ 完整查询成功:', fullResult);
    } catch (error) {
      console.error('❌ 完整查询失败:', error.message);
      console.error('错误详情:', error);
      
      // 分析错误
      if (error.message.includes('Failed query')) {
        console.log('错误类型: Drizzle查询失败');
        console.log('查询语句:', error.query);
        console.log('查询参数:', error.params);
      }
    }
    
    // 4. 测试直接SQL查询
    console.log('\n4. 测试直接SQL查询...');
    try {
      const sqlResult = await db.execute('SELECT * FROM users');
      console.log('✅ 直接SQL查询成功:', sqlResult);
    } catch (error) {
      console.error('❌ 直接SQL查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('调试失败:', error);
  } finally {
    process.exit(0);
  }
}

debugDrizzleQuery(); 