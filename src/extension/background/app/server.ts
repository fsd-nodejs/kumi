import type { IWebSocketClient, KoaMessage, RequestListener } from '../koa-ts'
import { KoaRequest, Session } from '../koa-ts'
import SafeEventEmitter from '../utils/safe-event-emitter'
import { isKoaMessage } from '../utils/types-utils'
import SessionManager from './session.manager'

interface BackgroundServerOptionsProps {
  /**
   * this is life cycle hooks
   */
  beforeStart?: () => Promise<void>
  afterStart?: () => Promise<void>
  requestListener?: RequestListener
  onInstalled: (details: chrome.runtime.InstalledDetails) => void
}

export class BackgroundServer extends SafeEventEmitter {
  private requestListener?: RequestListener
  private beforeStart?: () => Promise<void>
  private afterStart?: () => Promise<void>
  constructor(props: BackgroundServerOptionsProps) {
    super()
    const { requestListener, beforeStart, afterStart, onInstalled } = props
    chrome.runtime.onInstalled.addListener(onInstalled)
    this.requestListener = requestListener
    this.beforeStart = beforeStart
    this.start().then(() => {
      return afterStart?.()
    })
  }

  getSession(params: {
    port?: chrome.runtime.Port
    wsClient?: IWebSocketClient
  }) {
    const session = new Session(params)
    SessionManager.addSession(session)
    return SessionManager.getSessionById(session.id) ?? session
  }

  async start() {
    await this.beforeStart?.()
    chrome.runtime.onConnect.addListener(this.handleConnectEvent.bind(this))
  }

  handleConnectEvent(port: chrome.runtime.Port) {
    const session = new Session({ port })
    SessionManager.addSession(session)
    port.onMessage.addListener((message) => {
      if (isKoaMessage(message)) {
        this.onPortStreamMessage(message, port)
      }
    })
    port.onDisconnect.addListener(async () => {})
  }

  onPortStreamMessage(message: KoaMessage, port: chrome.runtime.Port) {
    const payload = message.payload
    const session = this.getSession({ port })
    const koaMsg = {
      to: message.to,
      payload,
      from: session.origin,
    }
    const request = new KoaRequest(session, { ...koaMsg })
    if (this.requestListener) {
      this.requestListener(request)
    }
  }
}

export const createServer = (
  props: BackgroundServerOptionsProps,
): BackgroundServer => {
  return new BackgroundServer(props)
}
