import {
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
  payloadId,
} from '@walletconnect/utils'

import SafeEventEmitter from '@/extension/background/utils/safe-event-emitter'

import type { IJsonRpcResponse } from '../..'
import type { KoaMessage } from '../../background/koa-ts/lib/message'
import {
  isJsonRpcResponse,
  isKoaMessage,
} from '../../background/utils/types-utils'
import { DappTransport } from './dapp-transport'

export class DappRpcClient extends SafeEventEmitter {
  transport: DappTransport
  constructor() {
    super()
    this.transport = new DappTransport()
    this.sendRequest = this.sendRequest.bind(this)
    this.transport.on('message', (message: KoaMessage) => {
      if (!isKoaMessage(message)) {
        return
      }
      const { payload } = message
      if (isJsonRpcRequest(payload)) {
        this.emit(payload.method, payload)
      } else if (isJsonRpcResponse(payload)) {
        this.emit(`response-${payload.id}`, payload)
      }
    })
  }
  sendRequest<T = any>(request: {
    method: string
    params?: any[]
    id?: number
  }): Promise<T> {
    const { method, params = [], id } = request
    const koaMsg: KoaMessage = {
      from: location.origin,
      to: '',
      payload: {
        method,
        params,
        id: id ?? payloadId(),
        jsonrpc: '2.0',
      },
    }

    this.transport.send(koaMsg)
    return new Promise<T>((resole, reject) => {
      this.once(`response-${koaMsg.payload.id}`, (resp) => {
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

  sendResponseRaw(resp: IJsonRpcResponse) {
    const koaMsg: KoaMessage = {
      from: location.origin,
      to: '',
      payload: resp,
    }

    this.transport.send(koaMsg)
  }
  sendResponse(params: { requestId: number; result?: any; error?: any }) {
    const resp: IJsonRpcResponse = {
      id: params.requestId,
      jsonrpc: '2.0',
      result: params.result,
      error: params.error,
    }
    this.sendResponseRaw(resp)
  }
}
