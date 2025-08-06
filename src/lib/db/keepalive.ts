import { db } from './index';

let keepAliveInterval: NodeJS.Timeout | null = null;

/**
 * 启动数据库保活机制
 * 定期发送心跳包，防止连接被云服务商回收
 */
export function startKeepAlive(intervalMinutes: number = 5) {
  if (keepAliveInterval) {
    console.log('保活机制已在运行中');
    return;
  }

  console.log(`启动数据库保活机制，间隔: ${intervalMinutes} 分钟`);
  
  keepAliveInterval = setInterval(async () => {
    try {
      await db.execute('SELECT 1 as heartbeat, NOW() as timestamp');
      console.log(`[${new Date().toISOString()}] 数据库心跳正常`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 数据库心跳失败:`, error);
    }
  }, intervalMinutes * 60 * 1000);

  // 立即执行一次心跳
  db.execute('SELECT 1 as heartbeat, NOW() as timestamp')
    .then(() => console.log(`[${new Date().toISOString()}] 初始心跳正常`))
    .catch(error => console.error(`[${new Date().toISOString()}] 初始心跳失败:`, error));
}

/**
 * 停止数据库保活机制
 */
export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('数据库保活机制已停止');
  }
}

/**
 * 检查保活机制状态
 */
export function isKeepAliveRunning(): boolean {
  return keepAliveInterval !== null;
} 