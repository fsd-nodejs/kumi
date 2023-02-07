import type {
  IJsonRpcRequest,
  IJsonRpcResponseSuccess,
  IJsonRpcResponseError,
} from '@deficonnect/types'

import type { IJsonRpcResponse } from '@/extension'

import type Application from '..'
import type { KoaMessage } from './message'
import { koaResponseForRequest } from './message'
import type { KoaRequest } from './request'

export class KoaContext<T = any> {
  req: KoaRequest
  app: Application
  responses: KoaMessage[] = []
  constructor(app: Application, req: KoaRequest) {
    this.app = app
    this.req = req
  }
  get id(): number {
    return this.req.id
  }
  get rpcReq(): IJsonRpcRequest | undefined {
    return this.req.rpcReq
  }
  get rpcRes(): IJsonRpcResponse | undefined {
    return this.req.rpcRes
  }
  get rpcResSuccess(): IJsonRpcResponseSuccess | undefined {
    return this.req.rpcResSuccess
  }
  get rpcError(): IJsonRpcResponseError | undefined {
    return this.req.rpcError
  }
  get from(): string {
    return this.req.from
  }
  get to(): string {
    return this.req.to
  }
  /**
   * this is request params from RPC params
   *
   * and  the params type this `Array`
   */
  get params(): T {
    return (this.req?.rpcReq?.params ?? []) as unknown as T
  }

  pushResponse<R, E>(result: R, error?: E) {
    this.responses.push(
      koaResponseForRequest({
        reqMsg: this.req.msg,
        result,
        error,
      }),
    )
    return { result, error }
  }
}
