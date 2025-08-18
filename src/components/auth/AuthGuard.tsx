'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Loading from '@/components/ui/Loading'
import Cookies from 'js-cookie'
interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)

  // 公开路由：登录页直接放行
  const isLoginPage = pathname === '/admin/login'
  useEffect(() => {
    // 仅在浏览器端执行
    if (typeof window === 'undefined') return
    const token = Cookies.get('access_token')
    // 登录页不做校验
    if (isLoginPage) {
      if (token) {
        router.replace('/admin/index')
      } else {
        setChecking(false)
      }
      return
    }
    // 读取前端可访问的 token（本地缓存或非 HttpOnly Cookie）

    if (!token || token === 'undefined') {
      const search = window.location.search || ''
      const redirect = encodeURIComponent(pathname + search)
      router.replace(`/admin/login?redirect=${redirect}`)
      return
    }
    setChecking(false)
  }, [isLoginPage, pathname, router, searchParams])
  if (checking) {
    return <Loading />
  }

  return <>{children}</>
}

export default AuthGuard


