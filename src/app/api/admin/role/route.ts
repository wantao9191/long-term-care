import { ok } from "../../_utils/response"
import { NextRequest } from "next/server"
import { createHandler } from "../../_utils/handler"

export const GET = createHandler(async (request: NextRequest) => {
  const { page, pageSize } = await request.json()
  return ok({})
})