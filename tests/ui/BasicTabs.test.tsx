import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BasicTabs from '@/components/layouts/BasicTabs'

describe('BasicTabs', () => {
  it('渲染多个标签并默认激活 “关于”', () => {
    render(<BasicTabs />)
    // 标签文本
    expect(screen.getByText('分析页')).toBeInTheDocument()
    expect(screen.getByText('工作台')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
    // 默认 key="关于"，Antd 会设置 aria-selected
    const aboutTab = screen.getByRole('tab', { name: /关于/ })
    expect(aboutTab.getAttribute('aria-selected')).toBe('true')
  })
})


