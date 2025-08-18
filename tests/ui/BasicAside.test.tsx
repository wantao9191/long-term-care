import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BasicAside from '@/components/layouts/BasicAside'

vi.mock('next/navigation', () => ({ usePathname: () => '/admin/index' }))
vi.mock('@/hooks', () => ({ useAuth: () => ({ userInfo: { name: 'Alice' } }) }))

describe('BasicAside', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('渲染用户名与菜单项，点击父级展开子菜单', () => {
    render(<BasicAside collapsed={true} toggleCollapsed={() => {}} /> as any)
    // 用户名显示
    expect(screen.getByText('Alice')).toBeInTheDocument()
    // 点击“系统管理”展开
    const sys = screen.getByText('系统管理')
    fireEvent.click(sys)
    // 展开后应显示一个子菜单项，如“用户管理”
    expect(screen.getByText('用户管理')).toBeInTheDocument()
  })
})


