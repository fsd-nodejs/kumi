import assert from 'assert'

import SubscriptionManager from '../app/subscription.manager'
import type { KoaContext } from '../koa-ts'

const SubscribeController = {
  async subscribe_register(ctx: KoaContext) {
    assert.equal(ctx.req.sess.role, 'popup', 'Not as expected role')
    await SubscriptionManager.register(ctx)
    return ctx.pushResponse('success')
  },
  async subscribe_remove(ctx: KoaContext) {
    assert.equal(ctx.req.sess.role, 'popup', 'Not as expected role')
    const { path } = ctx.req.rpcReq?.params[0]
    const session = ctx.req.sess
    SubscriptionManager.removeSub({ path, session })
    return ctx.pushResponse('success')
  },
}

export default SubscribeController
