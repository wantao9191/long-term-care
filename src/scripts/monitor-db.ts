import 'dotenv/config';
import { db } from '../lib/db';
import fs from 'fs';
import path from 'path';

interface HealthStatus {
  timestamp: string;
  status: 'healthy' | 'unhealthy';
  database_name: string;
  database_size: string;
  table_count: number;
  data_count: number;
  error?: string;
}

async function monitorDatabase() {
  const logFile = path.join(process.cwd(), 'db-health.log');
  const status: HealthStatus = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    database_name: '',
    database_size: '',
    table_count: 0,
    data_count: 0
  };

  try {
    console.log('=== 数据库监控检查 ===');
    console.log('时间:', status.timestamp);
    
    // 基本连接测试
    const result = await db.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ 连接正常');
    
    // 数据库信息
    const dbInfo = await db.execute(`
      SELECT 
        current_database() as database_name,
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `);
    
    status.database_name = dbInfo[0]?.database_name || '';
    status.database_size = dbInfo[0]?.database_size || '';
    
    // 检查表
    const appTables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'users', 'roles')
    `);
    
    status.table_count = appTables.length;
    
    // 检查数据
    if (appTables.length > 0) {
      const orgCount = await db.execute('SELECT COUNT(*) as count FROM organizations');
      const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
      const roleCount = await db.execute('SELECT COUNT(*) as count FROM roles');
      
      status.data_count = (orgCount[0]?.count || 0) + (userCount[0]?.count || 0) + (roleCount[0]?.count || 0);
    }
    
    console.log('数据库名称:', status.database_name);
    console.log('数据库大小:', status.database_size);
    console.log('表数量:', status.table_count);
    console.log('数据总数:', status.data_count);
    
  } catch (error) {
    console.error('❌ 监控检查失败:', error);
    status.status = 'unhealthy';
    status.error = error.message;
  }
  
  // 记录到日志文件
  const logEntry = `${status.timestamp} | ${status.status} | ${status.database_name} | ${status.database_size} | 表:${status.table_count} | 数据:${status.data_count}${status.error ? ` | 错误:${status.error}` : ''}\n`;
  
  fs.appendFileSync(logFile, logEntry);
  console.log('日志已记录到:', logFile);
  
  // 如果是生产环境，可以发送告警
  if (process.env.NODE_ENV === 'production' && status.status === 'unhealthy') {
    console.log('⚠️  数据库状态异常，建议检查');
  }
  
  process.exit(status.status === 'healthy' ? 0 : 1);
}

monitorDatabase(); 