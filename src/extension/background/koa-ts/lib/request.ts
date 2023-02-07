import type {
  IJsonRpcRequest,
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
} from '@deficonnect/types'
import {
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
} from '@deficonnect/utils'

import type { IJsonRpcResponse } from '@/extension'

import { isJsonRpcResponse } from '../../utils/types-utils'
import type { KoaMessage } from './message'
import type { Session } from './session'

export class KoaRequest {
  readonly sess: Session
  readonly msg: KoaMessage
  constructor(sess: Session, msg: KoaMessage) {
    this.msg = msg
    this.sess = sess
  }

  get from(): string {
    return this.msg.from
  }

  get to(): string {
    return this.msg.to
  }

  get id(): number {
    return this.msg.payload.id
  }

  get rpcReq(): IJsonRpcRequest | undefined {
    if (this.msg.payload && isJsonRpcRequest(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcRes(): IJsonRpcResponse | undefined {
    if (this.msg.payload && isJsonRpcResponse(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcResSuccess(): IJsonRpcResponseSuccess | undefined {
    if (this.msg.payload && isJsonRpcResponseSuccess(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcError(): IJsonRpcResponseError | undefined {
    if (this.msg.payload && isJsonRpcResponseError(this.msg.payload)) {
      return this.msg.payload
    }
  }
  async respond(): Promise<void> {
    if (this.msg) {
      try {
        await this.sess.sendMsg(this.msg)
      } catch (e) {}
    }
  }
}
