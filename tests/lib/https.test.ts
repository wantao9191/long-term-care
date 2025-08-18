import { beforeEach, describe, expect, it, vi } from 'vitest'
import HttpRequest from '@/lib/https'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/current',
}))

const cookieStore: Record<string, string | undefined> = {}
vi.mock('js-cookie', () => ({
  default: {
    get: (k: string) => cookieStore[k],
    set: (k: string, v: string) => { cookieStore[k] = v },
    remove: (k: string) => { delete cookieStore[k] },
  },
}))

type JsonBody = any

function jsonResponse(body: JsonBody, status = 200, headers: Record<string, string> = { 'content-type': 'application/json' }) {
  const h = new Map(Object.entries(headers))
  const res: any = {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (k: string) => h.get(k.toLowerCase()) || h.get(k) },
    json: async () => body,
    text: async () => JSON.stringify(body),
    blob: async () => new Blob([JSON.stringify(body)]),
  }
  res.clone = () => jsonResponse(body, status, headers)
  return res
}

describe('https', () => {
  const http = new HttpRequest({ baseURL: '/api' })

  beforeEach(() => {
    vi.restoreAllMocks()
    ;(global as any).window = undefined
    for (const k of Object.keys(cookieStore)) delete cookieStore[k]
  })

  it('JSON(code=200) 成功响应', async () => {
    const seen: { url?: string; headers?: any } = {}
    ;(global as any).fetch = vi.fn(async (url: string, init?: RequestInit) => {
      seen.url = url
      seen.headers = init?.headers
      return jsonResponse({ code: 200, message: 'OK', data: { a: 1 } }, 200)
    })

    // 提供 token
    ;(global as any).window = {} as any
    cookieStore['access_token'] = 't-123'

    const res = await http.get('/hello')
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ a: 1 })
    expect(seen.url).toBe('/api/hello')
    expect(JSON.stringify(seen.headers)).toContain('Authorization')
  })

  it('JSON(code!=200) 抛出业务错误', async () => {
    ;(global as any).fetch = vi.fn(async () => jsonResponse({ code: 400, message: 'bad', data: null }, 200))
    await expect(http.get('/x')).rejects.toMatchObject({ name: 'HttpError', code: 400 })
  })

  it('JSON(无code) 且 HTTP 200 走 http 语义', async () => {
    ;(global as any).fetch = vi.fn(async () => jsonResponse({ result: 1 }, 200))
    const res = await http.get('/no-code')
    expect(res.success).toBe(true)
    expect(res.code).toBe(200)
    expect(res.data).toEqual({ result: 1 })
  })

  it('HTTP 401 触发刷新并重试成功', async () => {
    ;(global as any).window = {} as any
    cookieStore['refreshToken'] = 'r-123'

    let first = true
    ;(global as any).fetch = vi.fn(async (url: string) => {
      if (String(url).endsWith('/auth/refresh')) {
        return jsonResponse({ data: { accessToken: 'new-token' } }, 200)
      }
      if (first) {
        first = false
        return jsonResponse({ message: 'unauth' }, 401)
      }
      return jsonResponse({ code: 200, data: { ok: true } }, 200)
    })

    const res = await http.get('/secure')
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ ok: true })
    // 新 token 已写入
    expect(cookieStore['access_token']).toBe('new-token')
  })

  it('网络错误(TypeError 含 fetch) 映射为 -1', async () => {
    ;(global as any).fetch = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    await expect(http.get('/neterr')).rejects.toMatchObject({ name: 'HttpError', code: -1 })
  })

  it('AbortError 映射为 -2', async () => {
    const err = new Error('aborted')
    ;(err as any).name = 'AbortError'
    ;(global as any).fetch = vi.fn(async () => { throw err })
    await expect(http.get('/timeout')).rejects.toMatchObject({ name: 'HttpError', code: -2 })
  })
})


