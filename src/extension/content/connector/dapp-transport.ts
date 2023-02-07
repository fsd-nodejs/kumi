import type { ITransportEvent } from '@walletconnect/types'

import type { KoaMessage } from '@/extension/background/koa-ts/lib/message'
import { isKoaMessage } from '@/extension/background/utils/types-utils'

import type { ProxyRequestResponse } from '@/extension'

export class DappTransport {
  readonly connected: boolean = true
  private _events: ITransportEvent[] = []
  constructor() {
    window.addEventListener('message', this._receiveMessageFromContentScript)
    this.send = this.send.bind(this)
  }
  _receiveMessageFromContentScript = (e: any) => {
    const request: ProxyRequestResponse = e.data
    if (request?.type !== 'defi-connector-proxy-request-response') {
      return
    }
    const msg = request.payload
    if (!isKoaMessage(msg)) {
      return
    }
    const events = this._events.filter((event) => event.event === 'message')
    if (events && events.length) {
      events.forEach((event) => event.callback(msg))
    }
  }
  public send(message: KoaMessage): void {
    if (!isKoaMessage(message)) {
      throw new Error('message not a KoaMessage format')
    }
    this._proxySendMsg(message)
  }

  on = (event: string, callback: (payload: any) => void) => {
    this._events.push({ event, callback })
  }
  private _proxySendMsg(message: KoaMessage) {
    window.postMessage(
      {
        type: 'defi-connector-proxy-request',
        payload: message,
      },
      location.origin,
    )
  }
}
