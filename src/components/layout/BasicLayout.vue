<template>
  <div class="flex h-screen bg-gray-50/50 overflow-hidden">
    <!-- 侧边栏 -->
    <BasicSidebar
      :collapsed="collapsed"
      :active-menu="activeMenu"
      :menu-items="menuItems"
      @menu-select="handleMenuSelect"
      @toggle-collapse="toggleCollapse"
    />

    <!-- 主内容区域 -->
    <div
      class="flex-1 flex flex-col bg-gray-50/50 overflow-hidden transition-all duration-500"
    >
      <!-- 顶部导航栏 -->
      <BasicHeader
        :collapsed="collapsed"
        :current-page="currentPage"
        :user-info="userInfo"
        @toggle-collapse="toggleCollapse"
        @user-command="handleUserCommand"
      />

      <!-- 标签页区域 -->
      <BasicTabs
        @tab-click="handleTabClick"
        @close-tab="closeTab"
        @tabs-action="handleTabsAction"
      />

      <!-- 内容区域 -->
      <main class="flex-1 p-6 overflow-y-auto bg-gray-50/50">
        <div
          class="bg-white rounded-2xl shadow-lg p-8 min-h-full border-2 border-gray-100/50 backdrop-blur-sm"
        >
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
// @ts-ignore
import BasicSidebar from './BasicSidebar.vue'
// @ts-ignore
import BasicHeader from './BasicHeader.vue'
// @ts-ignore
import BasicTabs from './BasicTabs.vue'
import { useSidebar } from '@/composables/useSidebar'
import { useUser } from '@/composables/useUser'
import { useTabs } from '@/composables/useTabs'

// 使用组合式函数
const {
  collapsed,
  currentPage,
  activeMenu,
  menuItems,
  toggleCollapse,
  handleMenuSelect,
  setCurrentPage
} = useSidebar()

const { userInfo, handleUserCommand } = useUser()
const { handleTabClick, closeTab, handleTabsAction } = useTabs()

// 生命周期
onMounted(() => {
  setCurrentPage()
})
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .layout-sider {
    position: fixed;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .layout-sider.show-mobile {
    transform: translateX(0);
  }
}
</style>