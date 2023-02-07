import type { ClientRole } from '@/extension'

import type { Session } from '../koa-ts'

class SessionManagerCore {
  allSession: Map<string, Session> = new Map<string, Session>()
  getSessionById(id: string): Session | undefined {
    return this.allSession.get(id)
  }
  getSessionsByOrigin(origin: string): Session[] {
    return new Array(...this.allSession)
      .map((pairs) => pairs[1])
      .filter((s) => s.origin === origin)
  }
  getSessionsByRole(role: ClientRole): Session[] {
    return new Array(...this.allSession)
      .map((pairs) => pairs[1])
      .filter((s) => s.role === role)
  }
  addSession(session: Session) {
    if (!this.allSession.get(session.id)) {
      this.allSession.set(session.id, session)
      session.on('disconnect', () => {
        this.allSession.delete(session.id)
      })
    }
  }
  reset() {
    this.allSession = new Map<string, Session>()
  }
}

const SessionManager = new SessionManagerCore()
export default SessionManager
