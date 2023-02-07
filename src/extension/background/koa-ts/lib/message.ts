import type { IJsonRpcRequest } from '@deficonnect/types'

import type { IJsonRpcMessage } from '@/extension'

import { constructJsonRpcResponse } from '../../utils/rpc-message-utils'

export interface KoaMessage {
  /**
   * from origin
   */
  readonly from: string
  /**
   * to origin
   */
  readonly to: string
  readonly payload: IJsonRpcMessage
}

export function koaResponseForRequest(params: {
  reqMsg: KoaMessage
  result?: any
  error?: any
}): KoaMessage {
  const resp = constructJsonRpcResponse({
    id: params.reqMsg.payload.id,
    result: params.result,
    error: params.error,
  })
  return {
    from: params.reqMsg.to,
    to: params.reqMsg.from,
    payload: resp,
  }
}

/**
 * this is the subset of KoaMessage class
 * the payload will only be IJsonRpcRequest type
 */
export interface KoaReqMessage extends KoaMessage {
  from: string
  to: string
  payload: IJsonRpcRequest
}
