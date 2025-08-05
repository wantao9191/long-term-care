import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';

async function testDrizzleQuery() {
  try {
    console.log('=== 测试Drizzle ORM查询 ===');
    
    // 1. 测试直接SQL查询（已知可以工作）
    console.log('\n1. 测试直接SQL查询...');
    const sqlResult = await db.execute('SELECT * FROM users');
    console.log('✅ SQL查询成功:', sqlResult);
    
    // 2. 测试Drizzle ORM查询
    console.log('\n2. 测试Drizzle ORM查询...');
    try {
      const drizzleResult = await db.select().from(users);
      console.log('✅ Drizzle ORM查询成功:', drizzleResult);
    } catch (error) {
      console.error('❌ Drizzle ORM查询失败:', error.message);
      console.error('错误详情:', error);
    }
    
    // 3. 测试部分字段查询
    console.log('\n3. 测试部分字段查询...');
    try {
      const partialResult = await db.select({
        id: users.id,
        username: users.username,
        name: users.name
      }).from(users);
      console.log('✅ 部分字段查询成功:', partialResult);
    } catch (error) {
      console.error('❌ 部分字段查询失败:', error.message);
    }
    
    // 4. 测试计数查询
    console.log('\n4. 测试计数查询...');
    try {
      const countResult = await db.select({ count: sql`count(*)` }).from(users);
      console.log('✅ 计数查询成功:', countResult);
    } catch (error) {
      console.error('❌ 计数查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testDrizzleQuery(); 