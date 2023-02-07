import {
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
  payloadId,
  uuid,
} from '@deficonnect/utils'

import { KOA_MESSAGE_MOBILE_ORIGIN } from '@/extension/common/constants'

import type { ClientRole } from '@/extension'

import SafeEventEmitter from '../../utils/safe-event-emitter'
import {
  isKoaMessage,
  roleOfExtensionClientPort,
} from '../../utils/types-utils'
import type { KoaMessage } from './message'

export interface IWebSocketClient {
  send: (msg: KoaMessage) => void
  sendRaw: (msg: any) => void
  id: string
}
export class Session extends SafeEventEmitter {
  role: ClientRole
  private chromePort?: chrome.runtime.Port
  private wsClient?: IWebSocketClient
  id: string
  /**
   * current displayed request on the popup window
   */
  viewingRequestId?: number

  get origin(): string {
    if (this.chromePort) {
      return this.chromePort?.sender?.origin ?? this.id
    } else {
      return KOA_MESSAGE_MOBILE_ORIGIN
    }
  }

  constructor(params: {
    port?: chrome.runtime.Port
    wsClient?: IWebSocketClient
  }) {
    super()
    const { port, wsClient } = params
    if (port) {
      this.role = roleOfExtensionClientPort(port)
      this.chromePort = port
      port.onDisconnect.addListener(() => {
        this.emit('disconnect')
      })
      port.onMessage.addListener((message) => {
        this.receiveMessageFromDapp(message)
      })
      this.id = port.name
    } else if (wsClient) {
      this.role = 'mobile'
      this.wsClient = wsClient
      this.id = wsClient.id
    } else {
      this.role = 'unknown'
      this.id = uuid()
    }
  }

  private receiveMessageFromDapp = (message: any) => {
    if (!isKoaMessage(message)) {
      return
    }
    const { payload } = message
    if (isJsonRpcRequest(payload)) {
      this.emit(payload.method, payload)
    } else if (isJsonRpcResponseSuccess(payload)) {
      this.emit(`response-${payload.id}`, payload)
    } else if (isJsonRpcResponseError(payload)) {
      this.emit(`response-${payload.id}`, payload)
    }
  }

  async sendRaw(msg: any) {
    if (this.chromePort) {
      this.chromePort.postMessage(msg)
    } else if (this.wsClient) {
      this.wsClient.sendRaw(msg)
    }
  }

  async sendMsg(msg: KoaMessage) {
    if (this.chromePort) {
      this.chromePort.postMessage(msg)
    } else if (this.wsClient) {
      this.wsClient.send(msg)
    }
  }
  async sendRequestRPC(req: { method: string; params: any[]; from?: string }) {
    const { method, params, from = '' } = req
    const msg: KoaMessage = {
      from,
      to: this.origin,
      payload: {
        id: payloadId(),
        jsonrpc: '2.0',
        method,
        params,
      },
    }
    return this.sendMsg(msg)
  }
  async sendRequest<T>(req: {
    method: string
    params: any[]
    from?: string
  }): Promise<T> {
    const { method, params, from = '' } = req
    const koaMsg: KoaMessage = {
      from,
      to: this.origin,
      payload: {
        id: payloadId(),
        jsonrpc: '2.0',
        method,
        params,
      },
    }
    this.sendMsg(koaMsg)
    return new Promise<T>((resole, reject) => {
      const timer = setTimeout(() => {
        this.emit(`response-${koaMsg.payload.id}`, {
          id: koaMsg.payload.id,
          jsonrpc: '2.0',
          error: { code: 408, message: 'request time out' },
        })
      }, 30 * 1000)
      this.once(`response-${koaMsg.payload.id}`, (resp) => {
        clearTimeout(timer)
        if (isJsonRpcResponseSuccess(resp)) {
          resole(resp.result)
        } else if (isJsonRpcResponseError(resp)) {
          reject(resp.error)
        } else {
          reject(new Error('can not parse the response'))
        }
      })
    })
  }
  async sendRespondRPC(params: {
    id: number
    result?: any
    error?: Error
    from: string
  }) {
    const msg: KoaMessage = {
      from: params.from,
      to: this.origin,
      payload: {
        id: params.id,
        jsonrpc: '2.0',
        result: params.result,
        error: params.error,
      },
    }
    return this.sendMsg(msg)
  }
  async sendRpcResponse(params: { payload: any; from: string }) {
    const msg: KoaMessage = {
      from: params.from,
      to: this.origin,
      payload: params.payload,
    }
    return this.sendMsg(msg)
  }
}
