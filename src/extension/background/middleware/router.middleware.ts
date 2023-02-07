import type { KoaContext } from '../koa-ts'
import type { IRouters } from '../router'
import Router from '../router'

const dispatchRoute = async (ctx: KoaContext) => {
  const method = (ctx.rpcReq?.method ?? '') as IRouters
  if (typeof Router[method] === 'function') {
    const fn = Router[method]
    await fn(ctx)
  }
}

/**
 * This middleware will dispatch RPC request to Dispatched to the corresponding controller
 */
const RouterMiddleware = async (ctx: KoaContext, next: () => Promise<any>) => {
  await dispatchRoute(ctx)
  await next()
}
export default RouterMiddleware
