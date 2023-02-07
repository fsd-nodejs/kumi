import SessionManager from '../app/session.manager'
import type { KoaContext } from '../koa-ts'

const RespondMiddleware = async (ctx: KoaContext, next: () => Promise<any>) => {
  await next()
  await Promise.all(
    ctx.responses.map(async (res) => {
      const sessions = SessionManager.getSessionsByOrigin(res.to)
      return sessions.map((session) => {
        return session.sendMsg(res).catch()
      })
    }),
  )
}

export default RespondMiddleware
