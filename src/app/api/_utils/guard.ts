import type { NextRequest } from 'next/server'
import { unauthorized, badRequest, methodNotAllowed } from './response'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type GuardOptions = {
	allow?: Method[]
	requireHeaders?: string[]
	requireAuth?: boolean
}

export function guard(request: NextRequest, options: GuardOptions = {}) {
	const { allow, requireHeaders = [], requireAuth = false } = options

	// 校验方法
	if (allow && !allow.includes(request.method as Method)) {
		return methodNotAllowed(allow)
	}

	// 校验必须 Header
	for (const h of requireHeaders) {
		if (!request.headers.get(h)) {
			return badRequest(`Missing header: ${h}`)
		}
	}
	return null
}


