import assert from 'assert'

import type { KoaContext } from '../koa-ts'
import { PopupRequestService } from '../service/popup.request.service'
import { constructJsonRpcResponse } from '../utils/rpc-message-utils'
import { isKoaReqMessage } from '../utils/types-utils'

const DCController = {
  async dc_rejectDappRequest(ctx: KoaContext) {
    const { originReq } = ctx.rpcReq?.params[0]
    assert(isKoaReqMessage(originReq), 'originReq is not a KoaReqMessage')
    await PopupRequestService.removeRequestById(originReq.payload.id)

    // notify dapp transaction rejected
    ctx.responses.push({
      from: ctx.from,
      to: originReq.from,
      payload: constructJsonRpcResponse({
        id: originReq.payload.id,
        error: { code: 4001, message: 'rejected' },
      }),
    })
    return ctx.pushResponse('success')
  },
}

export default DCController
