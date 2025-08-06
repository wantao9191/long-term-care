import { ref, computed } from 'vue'

// 菜单配置接口
export interface MenuItem {
  index: string
  title: string
  icon?: string
  children?: MenuItem[]
}

export function useSidebar() {
  // 侧边栏折叠状态
  const collapsed = ref(false)

  // 当前页面标题
  const currentPage = ref('')

  // 菜单数据
  const menuItems: MenuItem[] = [
    {
      index: '/admin/home',
      title: '仪表盘',
      icon: 'odometer'
    },
    {
      index: '/admin/user',
      title: '用户管理',
      icon: 'user'
    },
    {
      index: '/admin/organization',
      title: '机构管理',
      icon: 'office-building'
    },
    {
      index: 'system',
      title: '系统设置',
      icon: 'setting',
      children: [
        {
          index: '/admin/settings/profile',
          title: '个人资料',
          icon: 'user-filled'
        },
        {
          index: '/admin/settings/security',
          title: '安全设置',
          icon: 'lock'
        }
      ]
    },
    {
      index: '/admin/help',
      title: '帮助中心',
      icon: 'question-filled'
    }
  ]

  // 计算当前活跃菜单
  const activeMenu = computed(() => {
    const pathname = window.location.pathname
    
    // 精确匹配
    for (const item of menuItems) {
      if (item.index === pathname) {
        return item.index
      }
      
      // 检查子菜单
      if (item.children) {
        for (const child of item.children) {
          if (child.index === pathname) {
            return child.index
          }
        }
      }
    }
    
    // 模糊匹配（用于子路由）
    for (const item of menuItems) {
      if (pathname.startsWith(item.index) && item.index !== '/') {
        return item.index
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.index) && child.index !== '/') {
            return child.index
          }
        }
      }
    }
    
    return pathname
  })

  // 切换折叠状态
  const toggleCollapse = () => {
    collapsed.value = !collapsed.value
  }

  // 处理菜单选择
  const handleMenuSelect = (index: string) => {
    // 跳过父级菜单（没有实际路由）
    if (index === 'system') return
    if(index=== window.location.pathname) return  
    // 平滑过渡效果
    document.documentElement.style.setProperty('--page-transition', 'all 0.3s ease-in-out')
    
    // 延迟跳转以显示选中效果
    setTimeout(() => {
      window.location.href = index
    }, 150)
  }

  // 根据路由设置当前页面标题
  const setCurrentPage = () => {
    const pathname = window.location.pathname
    
    // 查找匹配的菜单项
    const findMenuItem = (items: MenuItem[]): string => {
      for (const item of items) {
        if (item.index === pathname) {
          return item.title
        }
        
        if (item.children) {
          const childTitle = findMenuItem(item.children)
          if (childTitle) return childTitle
        }
      }
      return ''
    }
    
    const title = findMenuItem(menuItems)
    currentPage.value = title || '未知页面'
  }

  // 获取面包屑导航
  const getBreadcrumb = () => {
    const pathname = window.location.pathname
    const breadcrumb: { title: string; path?: string }[] = []
    
    for (const item of menuItems) {
      if (item.index === pathname) {
        breadcrumb.push({ title: item.title, path: item.index })
        break
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (child.index === pathname) {
            breadcrumb.push({ title: item.title })
            breadcrumb.push({ title: child.title, path: child.index })
            break
          }
        }
      }
    }
    
    return breadcrumb
  }

  return {
    collapsed,
    currentPage,
    activeMenu,
    menuItems,
    toggleCollapse,
    handleMenuSelect,
    setCurrentPage,
    getBreadcrumb
  }
} 