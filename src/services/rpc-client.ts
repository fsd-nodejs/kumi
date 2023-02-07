import {
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
  payloadId,
  uuid,
} from '@deficonnect/utils'

import { retryPromise } from '@/utils/tools/promise-tools'

import type { KoaMessage } from '@/extension/background/koa-ts/lib/message'
import type {
  GetParameters,
  GetResponseType,
  IRouters,
} from '@/extension/background/router'
import SafeEventEmitter from '@/extension/background/utils/safe-event-emitter'
import { isKoaMessage } from '@/extension/background/utils/types-utils'
import { DappTransport } from '@/extension/content/connector/dapp-transport'

import type { ChromeConnectPortJSON, IJsonRpcResponse } from '@/extension'

interface SendRequestProps<T extends IRouters> {
  method: T
  params?: GetParameters<T>
  id?: number
}

interface SendOptionProps {
  timeout?: number
}

export class RpcClient extends SafeEventEmitter {
  port: chrome.runtime.Port
  transport?: DappTransport
  private portName: ChromeConnectPortJSON
  constructor(name: ChromeConnectPortJSON) {
    super()
    this.portName = name
    this.setMaxListeners(100)
    this.port = this.connectServiceWorker(JSON.stringify(name))
  }

  private connectServiceWorker(name: string) {
    const port = chrome?.runtime?.connect({ name })
    port?.onDisconnect.addListener(() => {
      setTimeout(() => {
        this.connectServiceWorker(name)
        this.emit('reconnect')
      }, 1000)
    })
    this.port = port
    this.port?.onMessage.addListener(this.receiveMessageFromService)

    // adapt for debug
    if (!port) {
      this.transport = new DappTransport()
      this.transport.on('message', this.receiveMessageFromService)
    }
    return port
  }

  private receiveMessageFromService = (message: any) => {
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

  private async postPortMessage<T>(msg: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.port?.postMessage(msg)
        if (!this.port) {
          this.transport?.send(msg as KoaMessage)
        }
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async sendRequest<T extends IRouters>(
    request: SendRequestProps<T>,
    options?: SendOptionProps,
  ): Promise<GetResponseType<T>> {
    const { method, params = [], id = payloadId() } = request
    const { timeout = 30 * 1000 } = options ?? {}
    const koaMsg: KoaMessage = {
      from: location.origin,
      to: '',
      payload: {
        method,
        params,
        id,
        jsonrpc: '2.0',
      },
    }

    const responsePromise: Promise<GetResponseType<T>> = new Promise(
      (resolve, reject) => {
        const timer = setTimeout(() => {
          this.emit(`response-${koaMsg.payload.id}`, {
            id: koaMsg.payload.id,
            jsonrpc: '2.0',
            error: { code: 408, message: 'request time out', method },
          })
        }, timeout)
        this.once(`response-${koaMsg.payload.id}`, (resp) => {
          clearTimeout(timer)
          if (isJsonRpcResponseSuccess(resp)) {
            resolve(resp.result)
          } else if (isJsonRpcResponseError(resp)) {
            reject(resp.error)
          } else {
            reject(new Error('can not parse the response'))
          }
        })
      },
    )

    await retryPromise(async () => {
      return this.postPortMessage(koaMsg)
    })

    return responsePromise
  }

  async sendResponseRaw(resp: IJsonRpcResponse) {
    await retryPromise(async () => {
      this.postPortMessage(resp)
    })
  }
  async sendResponse(params: { requestId: number; result?: any; error?: any }) {
    const resp: IJsonRpcResponse = {
      id: params.requestId,
      jsonrpc: '2.0',
      result: params.result,
      error: params.error,
    }
    return this.sendResponseRaw(resp)
  }
}

export const rpcClient = new RpcClient({
  role: 'popup',
  origin: global.location?.origin,
  uuid: uuid(),
})
