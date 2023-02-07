import assert from 'assert'

import type { KoaContext, Session } from '../koa-ts'

type SessionSet = Map<string, Session>

interface ISubscription<T> {
  data: () => Promise<T>
  onRegister?: () => Promise<void>
}

const Subscriptions: Record<string, ISubscription<unknown>> = {
  'popup.walletSession': {
    data: async function () {},
  },
}

export type ISubscriptions = keyof typeof Subscriptions

class SubscriptionManagerCore {
  private subscriptions: Map<string, SessionSet> = new Map<string, SessionSet>()
  async register(ctx: KoaContext) {
    const { path } = ctx.params[0] ?? {}
    const subscription = this.getSubscription({ path })
    assert.ok(subscription, `not support subscription "${path}"`)
    const session = ctx.req.sess
    const sessions = this.subscriptions.get(path) ?? new Map<string, Session>()
    sessions.set(session.id, session)
    this.subscriptions.set(path, sessions)
    if (subscription.onRegister) {
      try {
        await subscription.onRegister()
      } catch (e) {
        // ignore
      }
    }
    const existData = await subscription.data()
    await session.sendRequestRPC({
      method: 'subscribe_update',
      params: [
        {
          path,
          data: existData ?? {},
        },
      ],
    })
    session.on('disconnect', () => {
      this.removeAllSub({ session })
    })
  }
  getSubscription(params: { path: ISubscriptions }) {
    return Subscriptions[params.path]
  }
  async pushSubscriptionUpdate(params: { path: ISubscriptions }) {
    const path = params.path
    const subscription = this.getSubscription({ path })
    const existData = await subscription?.data()
    const sessions = this.subscriptions.get(path)
    try {
      sessions?.forEach((session) => {
        session.sendRequestRPC({
          method: 'subscribe_update',
          params: [
            {
              path,
              data: existData ?? {},
            },
          ],
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  removeSub(params: { path: string; session: Session }) {
    const { path, session } = params
    const sessions = this.subscriptions.get(path) ?? new Map<string, Session>()
    sessions.delete(session.id)
  }
  removeAllSub(params: { session: Session }) {
    const { session } = params
    this.subscriptions.forEach((value) => {
      value.delete(session.id)
    })
  }
}

const SubscriptionManager = new SubscriptionManagerCore()
export default SubscriptionManager
