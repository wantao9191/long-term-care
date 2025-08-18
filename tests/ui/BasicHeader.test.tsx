import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BasicHeader from '@/components/layouts/BasicHeader'

describe('BasicHeader', () => {
  it('渲染并触发折叠/主题/刷新', () => {
    const toggleCollapsed = vi.fn()
    const toggleTheme = vi.fn()
    const reloadSpy = vi.spyOn(window.location, 'reload' as any).mockImplementation(() => {})

    render(<BasicHeader collapsed={false} toggleCollapsed={toggleCollapsed} theme="light" toggleTheme={toggleTheme} />)

    // 折叠按钮
    fireEvent.click(screen.getByRole('img', { hidden: true }))
    expect(toggleCollapsed).toHaveBeenCalled()

    // 主题切换
    const themeIcon = screen.getAllByRole('img', { hidden: true }).find((el) => el.className.includes('SunFilled')) || screen.getAllByRole('img', { hidden: true })[1]
    fireEvent.click(themeIcon as HTMLElement)
    expect(toggleTheme).toHaveBeenCalled()

    // 刷新按钮
    const icons = screen.getAllByRole('img', { hidden: true })
    const reloadIcon = icons.find((el) => el.className.includes('Reload')) || icons[0]
    fireEvent.click(reloadIcon as HTMLElement)
    expect(reloadSpy).toHaveBeenCalled()
  })
})


