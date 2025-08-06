# 布局组件重构说明

## 重构目标
将原本的 `basicLayout.vue` 单文件组件拆分为多个小组件和组合式函数，提高代码的可维护性和复用性。

## 文件结构

```
src/components/layout/
├── basicLayout.vue      # 主布局组件（重构后）
├── Sidebar.vue          # 侧边栏组件
├── Header.vue           # 头部组件
├── Tabs.vue             # 标签页组件
└── README.md            # 说明文档

src/composables/
├── index.ts             # 组合式函数索引
├── useSidebar.ts        # 侧边栏逻辑
├── useUser.ts           # 用户相关逻辑
└── useTabs.ts           # 标签页逻辑
```

## 组件职责

### basicLayout.vue
- **职责**: 主布局容器，协调各个子组件
- **功能**: 
  - 使用组合式函数管理状态
  - 组合 Sidebar、Header、Tabs 组件
  - 提供内容插槽

### Sidebar.vue
- **职责**: 侧边栏菜单组件
- **功能**:
  - Logo 显示
  - 菜单导航
  - 收起/展开状态
- **Props**: `collapsed`, `activeMenu`
- **Events**: `menu-select`

### Header.vue
- **职责**: 顶部导航栏组件
- **功能**:
  - 折叠按钮
  - 面包屑导航
  - 工具栏（搜索、通知、全屏、设置）
  - 用户信息下拉菜单
- **Props**: `collapsed`, `currentPage`, `userInfo`
- **Events**: `toggle-collapse`, `user-command`

### Tabs.vue
- **职责**: 标签页组件
- **功能**:
  - 标签页列表
  - 标签页操作菜单
- **Events**: `tab-click`, `close-tab`, `tabs-action`

## 组合式函数

### useSidebar.ts
- 侧边栏折叠状态管理
- 当前页面标题管理
- 菜单选择处理

### useUser.ts
- 用户信息管理
- 用户操作处理（登录、设置、退出等）

### useTabs.ts
- 标签页操作处理
- 标签页点击、关闭、刷新等逻辑

## 优势

1. **可维护性**: 每个组件职责单一，便于维护和调试
2. **可复用性**: 组合式函数可以在其他组件中复用
3. **可测试性**: 小组件和组合式函数更容易进行单元测试
4. **可扩展性**: 新增功能时只需要修改对应的组件或组合式函数

## 使用方式

```vue
<template>
  <BasicLayout>
    <!-- 页面内容 -->
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/basicLayout.vue'
</script>
```

## 维护指南

1. **修改菜单**: 编辑 `Sidebar.vue` 中的菜单项
2. **修改头部**: 编辑 `Header.vue` 中的工具栏或用户信息
3. **修改标签页**: 编辑 `Tabs.vue` 中的标签页逻辑
4. **修改状态管理**: 编辑对应的组合式函数
5. **新增功能**: 创建新的组合式函数或子组件

## 注意事项

- 所有组件都使用 TypeScript 进行类型检查
- 使用 Element Plus 组件库
- 样式使用 Tailwind CSS
- 遵循 Vue 3 Composition API 最佳实践 