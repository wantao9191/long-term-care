import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ok, error } from './response'

export type Handler = (req: NextRequest) => Promise<any> | any

export type Handlers = Partial<Record<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', Handler>>

// Overloads to accept a single handler or a handlers map
export function createHandler(handler: Handler): (req: NextRequest) => Promise<NextResponse>
export function createHandler(handlers: Handlers): (req: NextRequest) => Promise<NextResponse>
export function createHandler(arg: Handler | Handlers) {
	if (typeof arg === 'function') {
		const handler = arg as Handler
		return async function route(request: NextRequest) {
			try {
				const data = await handler(request)
				if (data instanceof NextResponse) return data
				return ok(data)
			} catch (e: any) {
				console.error('API Error:', e)
				return error(e?.message || 'Internal Server Error', e?.status || 500)
			}
		}
	}

	const handlers = arg as Handlers
	return async function route(request: NextRequest) {
		const method = request.method as keyof Handlers
		const handle = handlers[method]
		if (!handle) {
			return error('Method Not Allowed', 405, { headers: { Allow: Object.keys(handlers).join(', ') } })
		}
		try {
			const data = await handle(request)
			if (data instanceof NextResponse) return data
			return ok(data)
		} catch (e: any) {
			console.error('API Error:', e)
			return error(e?.message || 'Internal Server Error', e?.status || 500)
		}
	}
}


