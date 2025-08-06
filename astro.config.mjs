import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import UnoCSS from 'unocss/astro';
import node from '@astrojs/node';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
export default defineConfig({
  integrations: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    UnoCSS(),
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    resolve: {
      alias: {
        '@': '/src',                    // 根路径别名
        '@components': '/src/components', // 组件路径
        '@pages': '/src/pages',         // 页面路径
        '@stores': '/src/stores',       // 状态管理路径
        '@lib': '/src/lib',             // 工具库路径
        '@styles': '/src/styles',       // 样式路径
        '@types': '/src/types',         // 类型定义路径
        '@utils': '/src/lib/utils',     // 工具函数路径
        '@auth': '/src/lib/auth',       // 认证相关路径
        '@db': '/src/lib/db',           // 数据库相关路径
        '@assets': '/public',    // 资源路径
      }
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: [
          'vue',
          'vue/macros',
          {
            'vue': ['defineProps', 'defineEmits', 'defineExpose', 'defineModel']
          }
        ],
        dts: true,
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: true,
      }),
    ],
  },
});