import { describe, it, expect, vi } from 'vitest'
import { createHandler } from '@/app/api/_utils/handler'
import { NextResponse } from 'next/server'

class MockRequest {
  constructor(public method: string = 'GET') {}
}

describe('api/_utils/handler', () => {
  it('single handler returns ok when data returned', async () => {
    const handler = createHandler(async () => ({ a: 1 }))
    const res: any = await handler(new MockRequest('GET') as any)
    const body = await res.json()
    expect(body.code).toBe(200)
    expect(body.data).toEqual({ a: 1 })
  })

  it('single handler can return NextResponse directly', async () => {
    const handler = createHandler(async () => NextResponse.json({ ok: true }, { status: 201 }))
    const res: any = await handler(new MockRequest('GET') as any)
    expect(res.status).toBe(201)
  })

  it('map handlers route by method', async () => {
    const handler = createHandler({
      GET: () => ({ g: 1 }),
      POST: () => ({ p: 1 }),
    })
    const resG: any = await handler(new MockRequest('GET') as any)
    const resP: any = await handler(new MockRequest('POST') as any)
    expect((await resG.json()).data).toEqual({ g: 1 })
    expect((await resP.json()).data).toEqual({ p: 1 })
  })

  it('method not allowed', async () => {
    const handler = createHandler({ GET: () => ({}) })
    const res: any = await handler(new MockRequest('PATCH') as any)
    expect(res.status).toBe(405)
  })

  it('errors are wrapped', async () => {
    const err = new Error('boom') as any
    ;(err as any).status = 418
    const handler = createHandler(async () => { throw err })
    const res: any = await handler(new MockRequest('GET') as any)
    expect(res.status).toBe(418)
    const body = await res.json()
    expect(body.message).toBe('boom')
  })
})


