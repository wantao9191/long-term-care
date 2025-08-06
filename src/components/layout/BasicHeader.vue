<template>
  <header
    class="h-16 bg-white border-b-2 border-gray-100/80 flex items-center justify-between px-6 shadow-lg relative z-99 backdrop-blur-sm"
  >
    <div class="flex items-center gap-6">
      <!-- 折叠按钮 -->
      <div
        class="w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 border border-gray-200/50 hover:border-blue-200"
        @click="$emit('toggle-collapse')"
      >
        <el-icon
          :size="20"
          class="transition-transform duration-300"
          :class="collapsed ? 'rotate-180' : ''"
        >
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 面包屑导航 -->
      <div
        class="flex items-center bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-200/50"
      >
        <el-breadcrumb separator="/" class="text-sm">
          <el-breadcrumb-item
            class="!text-gray-500 hover:!text-blue-600 transition-colors"
          >
            <el-icon class="mr-1.5"><House /></el-icon>
            <span>首页</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-if="currentPage"
            class="!text-gray-700 !font-medium"
          >
            {{ currentPage }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- 工具栏 -->
      <div
        class="flex items-center gap-1 mr-4 pr-4 border-r-2 border-gray-100"
      >
        <!-- 搜索 -->
        <div
          class="w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 border border-transparent hover:border-blue-200"
        >
          <el-icon :size="18"><Search /></el-icon>
        </div>

        <!-- 消息通知 -->
        <div
          class="w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 border border-transparent hover:border-blue-200 relative"
        >
          <el-badge :value="3" class="notification-badge">
            <el-icon :size="18"><Bell /></el-icon>
          </el-badge>
        </div>

        <!-- 全屏 -->
        <div
          class="w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 border border-transparent hover:border-blue-200"
          @click="toggleFullscreen"
        >
          <el-icon :size="18">
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
        </div>

        <!-- 设置 -->
        <div
          class="w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 border border-transparent hover:border-blue-200"
        >
          <el-icon :size="18"><Setting /></el-icon>
        </div>
      </div>

      <!-- 用户信息 -->
      <el-dropdown @command="handleUserCommand" class="cursor-pointer !outline-none">
        <div
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200/50 hover:border-blue-200 hover:shadow-md !outline-none"
        >
          <el-avatar
            :size="36"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            class="transition-all duration-300"
          />
          <div class="flex flex-col">
            <div class="text-sm font-semibold text-gray-700">
              {{ userInfo.name || "管理员" }}
            </div>
            <div class="text-xs text-gray-500">超级管理员</div>
          </div>
          <el-icon class="text-gray-400 transition-transform duration-300">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon class="mr-2"><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon class="mr-2"><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon class="mr-2"><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import {
  // 布局控制图标
  Fold,
  Expand,
  // 导航图标
  House,
  // 工具栏图标
  Search,
  Bell,
  FullScreen,
  Aim,
  Setting,
  // 用户相关图标
  ArrowDown,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'

interface Props {
  collapsed: boolean
  currentPage: string
  userInfo: any
}

interface Emits {
  (e: 'toggle-collapse'): void
  (e: 'user-command', command: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 全屏控制
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const handleUserCommand = (command: string) => {
  emit('user-command', command)
}
</script>

<style scoped>
/* 通知徽章样式 */
:deep(.notification-badge .el-badge__content) {
  @apply !bg-red-500 !border-2 !border-white !text-xs !min-w-5 !h-5 !leading-4 !font-bold;
}

/* 头像样式优化 - 彻底移除黑色边框 */
:deep(.el-avatar) {
  outline: none !important;
  border: 2px solid #f3f4f6 !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  background: transparent !important;
}

:deep(.el-avatar:hover) {
  outline: none !important;
  border: 2px solid #dbeafe !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  background: transparent !important;
}

:deep(.el-avatar img) {
  outline: none !important;
  border: none !important;
  background: transparent !important;
}

/* 移除所有可能状态的边框和轮廓 */
:deep(.el-avatar:focus),
:deep(.el-avatar:active),
:deep(.el-avatar:focus-visible),
:deep(.el-avatar:focus-within) {
  outline: none !important;
  border: 2px solid #f3f4f6 !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  background: transparent !important;
}

/* 移除可能的伪元素边框 */
:deep(.el-avatar::before),
:deep(.el-avatar::after) {
  display: none !important;
}

/* 确保dropdown触发器没有边框 */
:deep(.el-dropdown) {
  outline: none !important;
  border: none !important;
}

:deep(.el-dropdown-link) {
  outline: none !important;
  border: none !important;
}

:deep(.el-dropdown-link:focus),
:deep(.el-dropdown-link:active) {
  outline: none !important;
  border: none !important;
}

/* 移除所有可能的focus状态样式 */
:deep(.el-dropdown:focus),
:deep(.el-dropdown:focus-visible),
:deep(.el-dropdown:focus-within) {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 移除用户信息容器的可能边框 */
.flex.items-center.gap-3:focus,
.flex.items-center.gap-3:focus-visible,
.flex.items-center.gap-3:focus-within {
  outline: none !important;
  border-color: rgba(229, 231, 235, 0.5) !important;
}

/* 使用CSS变量覆盖Element Plus默认样式 */
:deep(.el-avatar) {
  --el-avatar-border-radius: 50%;
  --el-avatar-background-color: transparent;
  --el-avatar-text-color: inherit;
  --el-avatar-border: 2px solid #f3f4f6;
}

/* 彻底禁用所有可能的轮廓和边框 */
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