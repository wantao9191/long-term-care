import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BasicLayout from '@/components/layouts/BasicLayout'

vi.mock('@/hooks', () => ({
  useSlider: () => ({ collapsed: true, toggleCollapsed: vi.fn() }),
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

describe('BasicLayout', () => {
  it('渲染布局与子内容', () => {
    render(<BasicLayout><div>ChildContent</div></BasicLayout>)
    expect(screen.getByText('ChildContent')).toBeInTheDocument()
    // Header 渲染的“首页”面包屑
    expect(screen.getAllByText('首页').length).toBeGreaterThan(0)
  })
})


