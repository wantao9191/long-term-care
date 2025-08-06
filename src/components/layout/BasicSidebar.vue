<template>
  <div
    class="h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-out relative flex flex-col"
    :class="{
      'w-16': collapsed,
      'w-60': !collapsed,
    }"
  >
    <!-- Logo 区域 -->
    <div
      class="h-16 flex items-center justify-center px-4 bg-white border-b border-gray-100 transition-all duration-300"
    >
      <div
        class="flex items-center gap-3 transition-all duration-300"
        :class="{ 'justify-center': collapsed }"
      >
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300"
            :class="{ 'w-7 h-7': collapsed }"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 256 256"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M163.008 18.929c1.944 2.413 2.935 5.67 4.917 12.181l43.309 142.27a180.277 180.277 0 00-51.778-17.53l-28.35-93.29a3.67 3.67 0 00-7.042.01l-27.857 91.671a180.224 180.224 0 00-52.01 17.557l43.52-142.281c1.99-6.502 2.983-9.752 4.927-12.16a15.999 15.999 0 016.484-4.798c2.872-1.154 6.271-1.154 13.068-1.154h31.532c6.797 0 10.196 0 13.068 1.154a16.001 16.001 0 016.484 4.798zM54.139 220.054l37.552-122.971c-14.675 24.043-23.11 52.19-23.11 82.423 0 14.435 1.917 28.431 5.558 41.548zm147.722 0c3.641-13.117 5.558-27.113 5.558-41.548 0-30.233-8.435-58.38-23.11-82.423l37.552 122.971zM192.44 226.426c-12.621 4.651-26.234 7.574-40.44 8.42l-4.039-13.25a171.686 171.686 0 0044.479-95.596zm-128.88 0c3.264-32.133 15.31-61.618 33.236-85.596a171.686 171.686 0 0044.479 95.596l-4.039 13.25c-14.206-.846-27.819-3.769-40.44-8.42z"
                fill="#fff"
              />
            </svg>
          </div>
        </div>
        <div
          class="text-gray-900 text-lg font-semibold whitespace-nowrap transition-all duration-300"
          :class="{ 'opacity-0 w-0 overflow-hidden': collapsed }"
        >
          Astro Admin
        </div>
      </div>
    </div>

    <!-- 菜单区域 -->
    <div
      class="flex-1 py-4 overflow-y-auto overflow-x-hidden transition-all duration-300"
    >
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :unique-opened="true"
        :collapse-transition="false"
        background-color="transparent"
        text-color="#6b7280"
        active-text-color="#3b82f6"
        @select="handleMenuSelect"
        class="border-none bg-transparent"
      >
        <el-tooltip
          :content="collapsed ? item.title : ''"
          placement="right"
          :disabled="!collapsed"
          :show-after="200"
          v-for="(item, index) in menuItems"
          :key="index"
        >
          <div>
            <el-sub-menu
              :index="item.index"
              class="!mx-3 !mb-1"
              v-if="item.children"
            >
              <template #title>
                <div
                  class="flex items-center gap-3 w-full transition-all duration-300"
                  :class="{ 'justify-center gap-0': collapsed }"
                >
                                     <div
                     class="w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                     :class="{ 'scale-110': collapsed }"
                   >
                     <el-icon>
                       <component :is="iconMap[item.icon as keyof typeof iconMap]" />
                     </el-icon>
                   </div>
                   <span
                     class="text-sm font-medium whitespace-nowrap transition-all duration-300"
                     :class="{ 'w-0 overflow-hidden': collapsed }"
                     v-show="!collapsed"
                     >{{ item.title }}</span
                   >
                </div>
              </template>
              <el-menu-item
                v-for="(child, count) in item.children"
                :index="child.index"
                :key="count"
                class="!h-10 !mx-3 !mb-0.5 !rounded-md !bg-transparent !text-gray-500 !transition-all !duration-300 hover:!bg-gray-50 hover:!text-gray-900 hover:!translate-x-1"
              >
                <template #default>
                  <div
                    class="flex items-center w-full transition-all duration-300"
                    :class="{ 'pl-0': collapsed }"
                  >
                    <span
                      class="text-sm whitespace-nowrap transition-all duration-300"
                      :class="{ 'w-0': collapsed }"
                      >{{ child.title }}</span
                    >
                  </div>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item
              v-else
              :index="item.index"
              class="!h-12 !mx-3 !mb-1 !rounded-lg !bg-transparent !text-gray-600 !px-4 !transition-all !duration-300 hover:!bg-gray-50 hover:!text-gray-900 hover:!translate-x-0.5"
            >
              <template #default>
                <div
                  class="flex items-center gap-3 w-full transition-all duration-300"
                  :class="{ 'justify-center gap-0': collapsed }"
                >
                                     <div
                     class="w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                     :class="{ 'scale-110': collapsed }"
                   >
                     <el-icon>
                       <component :is="iconMap[item.icon as keyof typeof iconMap]" />
                     </el-icon>
                   </div>
                   <span
                     class="text-sm font-medium whitespace-nowrap transition-all duration-300"
                     :class="{ ' w-0 overflow-hidden': collapsed }"
                     v-show="!collapsed"
                     >{{ item.title }}</span
                   >
                </div>
              </template>
            </el-menu-item>
          </div>
        </el-tooltip>
      </el-menu>
    </div>

    <!-- 底部折叠按钮 -->
    <div
      class="h-12 flex items-center justify-start px-4 border-t border-gray-100 bg-white transition-all duration-300"
    >
      <div
        class="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all duration-300 bg-transparent hover:bg-gray-50 hover:scale-110 text-gray-600 hover:text-blue-500"
        @click="$emit('toggle-collapse')"
      >
        <svg
          v-if="!collapsed"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
        <svg
          v-if="collapsed"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Odometer,
  User,
  OfficeBuilding,
  Setting,
  UserFilled,
  Lock,
  QuestionFilled
} from '@element-plus/icons-vue'
import type { MenuItem } from "@/composables/useSidebar";

// 图标映射
const iconMap = {
  'odometer': Odometer,
  'user': User,
  'office-building': OfficeBuilding,
  'setting': Setting,
  'user-filled': UserFilled,
  'lock': Lock,
  'question-filled': QuestionFilled
}

interface Props {
  collapsed: boolean;
  activeMenu: string;
  menuItems: MenuItem[];
}

interface Emits {
  (e: "menu-select", index: string): void;
  (e: "toggle-collapse"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleMenuSelect = (index: string) => {
  emit("menu-select", index);
};
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar-container.show-mobile {
    transform: translateX(0);
  }
}

/* Element Plus 菜单深度样式调整 */
:deep(.el-menu) {
  border: none !important;
  background: transparent !important;
}

/* 激活状态样式 */
:deep(.el-menu-item.is-active) {
  background: rgba(59, 130, 246, 0.08) !important;
  color: #3b82f6 !important;
  font-weight: 600 !important;
}

:deep(.el-menu-item.is-active::after) {
  display: none;
}

/* 子菜单标题样式 */
:deep(.el-sub-menu .el-sub-menu__title) {
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 8px !important;
  background: transparent !important;
  color: #6b7280 !important;
  padding: 0 16px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-sub-menu .el-sub-menu__title:hover) {
  background: #f9fafb !important;
  color: #111827 !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #3b82f6 !important;
  font-weight: 600 !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: rgba(59, 130, 246, 0.08) !important;
  color: #3b82f6 !important;
  font-weight: 500 !important;
}

/* 子菜单箭头 */
:deep(.el-sub-menu__icon-arrow) {
  color: #9ca3af !important;
  transition: all 0.3s ease !important;
}

:deep(.el-sub-menu.is-opened .el-sub-menu__icon-arrow) {
  transform: rotateZ(180deg) !important;
  color: #6b7280 !important;
}

/* 折叠状态下隐藏箭头 */
:deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none !important;
}

/* 折叠状态下的菜单项 */
:deep(.el-menu--collapse .el-menu-item) {
  padding: 0 !important;
  margin: 0 8px 4px 8px !important;
  width: 48px !important;
  justify-content: center !important;
}

:deep(.el-menu--collapse .el-sub-menu .el-sub-menu__title) {
  padding: 0 !important;
  margin: 0 !important;
  width: 48px !important;
  justify-content: center !important;
  display: flex !important;
  align-items: center !important;
}

/* 修复折叠状态下子菜单图标居中 */
:deep(.el-menu--collapse .el-sub-menu .el-sub-menu__title > *) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

/* 滚动条样式 */
:deep(.flex-1::-webkit-scrollbar) {
  width: 4px;
}

:deep(.flex-1::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.flex-1::-webkit-scrollbar-thumb) {
  background: #e5e7eb;
  border-radius: 2px;
  transition: all 0.3s ease;
}

:deep(.flex-1::-webkit-scrollbar-thumb:hover) {
  background: #d1d5db;
}
</style>
