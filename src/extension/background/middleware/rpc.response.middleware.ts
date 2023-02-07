import type { KoaContext } from '../koa-ts'
import PopupRequestService from '../service/popup.request.service'

const processJsonRpcResponse = async (ctx: KoaContext) => {
  const rpcResponse = ctx.rpcRes
  if (rpcResponse) {
    await PopupRequestService.removeRequestById(rpcResponse.id)

    ctx.responses.push({
      from: ctx.from,
      to: ctx.to,
      payload: ctx.req.msg.payload,
    })
  }
}

const RpcResponseMiddleware = async (
  ctx: KoaContext,
  next: () => Promise<any>,
) => {
  await processJsonRpcResponse(ctx)
  await next()
}
export default RpcResponseMiddleware
