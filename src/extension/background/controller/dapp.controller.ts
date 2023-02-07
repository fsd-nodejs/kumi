import type { KoaContext } from '../koa-ts'

const DappController = {
  async dapp_ping(ctx: KoaContext) {
    return ctx.pushResponse('pong')
  },
}
export default DappController
