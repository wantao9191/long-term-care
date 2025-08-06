<template>
  <div
    class="h-12 bg-white border-b-2 border-gray-100/80 flex items-center justify-between px-4 shadow-sm backdrop-blur-sm"
  >
    <div class="flex-1 overflow-hidden">
      <el-scrollbar>
        <div class="flex items-center gap-2 py-1.5">
          <div
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 border-2 border-blue-200 rounded-lg text-sm cursor-pointer hover:from-blue-100 hover:to-blue-100 transition-all duration-300 shadow-sm"
            @click="$emit('tab-click', '/admin/home')"
          >
            <span class="font-medium">仪表盘</span>
            <el-icon
              class="w-4 h-4 hover:bg-blue-200 rounded-full p-0.5 transition-all duration-300 hover:scale-110"
              @click.stop="$emit('close-tab', '/admin/home')"
            >
              <Close />
            </el-icon>
          </div>
          <div
            class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border-2 border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
            @click="$emit('tab-click', '/admin/user')"
          >
            <span class="font-medium">用户管理</span>
            <el-icon
              class="w-4 h-4 hover:bg-gray-200 rounded-full p-0.5 transition-all duration-300 hover:scale-110"
              @click.stop="$emit('close-tab', '/admin/user')"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="flex-shrink-0 ml-3">
      <el-dropdown @command="$emit('tabs-action', $event)" class="!outline-none">
        <div
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 cursor-pointer !outline-none"
        >
          <el-icon :size="16"><More /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">刷新当前</el-dropdown-item>
            <el-dropdown-item command="close-others">
              关闭其他
            </el-dropdown-item>
            <el-dropdown-item command="close-all">
              关闭全部
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close, More } from '@element-plus/icons-vue'

interface Emits {
  (e: 'tab-click', path: string): void
  (e: 'close-tab', path: string): void
  (e: 'tabs-action', command: string): void
}

defineEmits<Emits>()
</script>

<style scoped>
/* 移除dropdown图标的黑色边框 */
:deep(.el-dropdown) {
  outline: none !important;
  border: none !important;
}

:deep(.el-dropdown:focus),
:deep(.el-dropdown:focus-visible),
:deep(.el-dropdown:focus-within) {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 移除图标的边框和轮廓 */
:deep(.el-icon) {
  outline: none !important;
  border: none !important;
}

:deep(.el-icon:focus),
:deep(.el-icon:focus-visible) {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 确保容器div没有边框 */
.w-8.h-8:focus,
.w-8.h-8:focus-visible,
.w-8.h-8:focus-within {
  outline: none !important;
  box-shadow: none !important;
}

/* 彻底禁用所有轮廓 */
* {
  outline: none !important;
}

*:focus,
*:focus-visible,
*:focus-within {
  outline: none !important;
  box-shadow: none !important;
}
</style> 