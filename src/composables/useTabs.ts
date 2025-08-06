export function useTabs() {
  // 标签页点击处理
  const handleTabClick = (path: string) => {
    window.location.href = path
  }

  // 关闭标签页
  const closeTab = (path: string) => {
    // 关闭标签页逻辑
    console.log("关闭标签页:", path)
  }

  // 处理标签页操作
  const handleTabsAction = (command: string) => {
    switch (command) {
      case "refresh":
        window.location.reload()
        break
      case "close-others":
        // 关闭其他标签页
        break
      case "close-all":
        // 关闭所有标签页
        break
    }
  }

  return {
    handleTabClick,
    closeTab,
    handleTabsAction
  }
} 