import 'dotenv/config';
import { db } from '../lib/db';

async function healthCheck() {
  try {
    console.log('=== 数据库健康检查 ===');
    console.log('时间:', new Date().toISOString());
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // 隐藏密码
    
    // 1. 基本连接测试
    console.log('\n1. 连接测试...');
    const result = await db.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ 连接正常, 当前时间:', result[0]?.current_time);
    
    // 2. 检查数据库信息
    console.log('\n2. 数据库信息...');
    const dbInfo = await db.execute(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version,
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `);
    console.log('数据库名称:', dbInfo[0]?.database_name);
    console.log('当前用户:', dbInfo[0]?.current_user);
    console.log('数据库大小:', dbInfo[0]?.database_size);
    
    // 3. 检查应用表是否存在
    console.log('\n3. 检查应用表...');
    const appTables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'users', 'roles')
      ORDER BY table_name
    `);
    
    if (appTables.length === 0) {
      console.log('⚠️  应用表不存在，需要运行数据库迁移');
      console.log('建议执行: pnpm db:migrate');
    } else {
      console.log('应用表状态:');
      appTables.forEach(table => {
        console.log(`  ✅ ${table.table_name} 存在`);
      });
    }
    
    // 4. 检查连接数
    console.log('\n4. 连接数检查...');
    const connections = await db.execute(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    console.log('总连接数:', connections[0]?.total_connections);
    console.log('活跃连接:', connections[0]?.active_connections);
    console.log('空闲连接:', connections[0]?.idle_connections);
    
    // 5. 检查数据库是否为空
    console.log('\n5. 检查数据...');
    if (appTables.length > 0) {
      try {
        const orgCount = await db.execute('SELECT COUNT(*) as count FROM organizations');
        const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
        const roleCount = await db.execute('SELECT COUNT(*) as count FROM roles');
        
        console.log('数据统计:');
        console.log(`  机构数: ${orgCount[0]?.count || 0}`);
        console.log(`  用户数: ${userCount[0]?.count || 0}`);
        console.log(`  角色数: ${roleCount[0]?.count || 0}`);
        
        if (orgCount[0]?.count === 0 && userCount[0]?.count === 0) {
          console.log('⚠️  数据库为空，建议执行: pnpm db:seed');
        }
      } catch (error) {
        console.log('数据检查失败，表可能未正确创建');
      }
    }
    
    console.log('\n✅ 健康检查完成');
    
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

healthCheck(); 