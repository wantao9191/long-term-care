/** @type {import('next').NextConfig} */
const nextConfig = {
  // 外部包配置
  serverExternalPackages: ['postgres'],
  
  // Turbopack 配置（移出experimental）
  turbopack: {
    // 确保 UnoCSS 相关文件被正确处理
    resolveAlias: {
      '@unocss/reset': '@unocss/reset',
    },
  },
  
  // 优化打包
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 图片优化配置
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    // 优化 Ant Design 的打包
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig
