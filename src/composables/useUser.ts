import { computed } from 'vue'
import { pinia } from '@/stores'
import useAuthStore from '@/stores/auth'

export function useUser() {
  const authStore = useAuthStore(pinia)

  // 用户信息
  const userInfo = computed(() => authStore.currentUser || {})

  // 处理用户命令
  const handleUserCommand = (command: string) => {
    switch (command) {
      case "profile":
        // 跳转到个人中心
        break
      case "settings":
        // 跳转到系统设置
        break
      case "logout":
        authStore.logout()
        break
    }
  }

  return {
    userInfo,
    handleUserCommand
  }
} 