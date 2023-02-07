import { IJsonRpcErrorMessage } from '@deficonnect/types'
import assert from 'assert'

import SubscriptionManager from '../app/subscription.manager'
import type { KoaContext } from '../koa-ts'
import type { KoaReqMessage } from '../koa-ts/lib/message'
import PopupRequestModel from '../model/popup.request.model'
import { constructJsonRpcResponse } from '../utils/rpc-message-utils'
import { isKoaReqMessage } from '../utils/types-utils'

export const POPUP_REQUEST_QUEUE_PATH = 'popup.uiRequestQueue'

export const PopupRequestService = {
  async addRequestToQueue(ctx: KoaContext, transformMsg?: KoaReqMessage) {
    const requestMsg = transformMsg ?? ctx.req.msg
    if (!isKoaReqMessage(requestMsg)) {
      return
    }
    await PopupRequestModel.popupRequests.put({
      id: requestMsg.payload.id,
      message: requestMsg,
      createTime: Date.now(),
    })
    await SubscriptionManager.pushSubscriptionUpdate({
      path: POPUP_REQUEST_QUEUE_PATH,
    })
    ctx.req.sess.on('disconnect', () => {
      this.removeRequestById(ctx.req.id)
    })
  },
  async getAllPendingRequests() {
    const requests = await PopupRequestModel.popupRequests
      .orderBy('createTime')
      .toArray()
    return requests.map((e) => e.message)
  },
  async removeAllPendingRequest() {
    await PopupRequestModel.popupRequests.clear()
    await SubscriptionManager.pushSubscriptionUpdate({
      path: POPUP_REQUEST_QUEUE_PATH,
    })
  },
  async removeLastRequest(): Promise<KoaReqMessage | undefined> {
    const request = await PopupRequestModel.popupRequests
      .orderBy('createTime')
      .reverse()
      .limit(1)
      .first()
    if (!request) {
      return
    }
    await PopupRequestModel.popupRequests.where({ id: request.id }).delete()
    await SubscriptionManager.pushSubscriptionUpdate({
      path: POPUP_REQUEST_QUEUE_PATH,
    })
    return request.message
  },
  async getRequestById(reqId: number): Promise<KoaReqMessage | undefined> {
    const request = await PopupRequestModel.popupRequests
      .where({
        id: reqId,
      })
      .first()
    if (!request) {
      return
    }
    return request.message
  },
  async removeRequestById(reqId: number): Promise<KoaReqMessage | undefined> {
    const request = await PopupRequestModel.popupRequests
      .where({
        id: reqId,
      })
      .first()
    if (!request) {
      return
    }
    await PopupRequestModel.popupRequests.where({ id: request.id }).delete()
    await SubscriptionManager.pushSubscriptionUpdate({
      path: POPUP_REQUEST_QUEUE_PATH,
    })
    return request.message
  },
  async removeRequest(ctx: KoaContext) {
    const rpcReq = ctx.rpcReq
    if (!rpcReq) {
      return
    }
    await this.removeRequestById(rpcReq.id)
  },
  async tryAddResponseToDapp(
    ctx: KoaContext,
    params: {
      result?: unknown
      error?: IJsonRpcErrorMessage
      originReqId?: number
    },
  ) {
    try {
      assert.equal(ctx.req.sess.role, 'popup')
      const { originReqId, ...resp } = params
      const originReq = await PopupRequestService.removeRequestById(
        originReqId ?? ctx.id,
      )

      assert.ok(originReq)
      assert.ok(params)

      ctx.responses.push({
        from: ctx.from,
        to: originReq.from,
        payload: constructJsonRpcResponse({
          ...resp,
          id: originReq.payload.id,
        }),
      })
    } catch (e) {}
  },
  async rejectAllPendingRequest(
    ctx: KoaContext,
    params?: { excludeReqId: number },
  ) {
    const { excludeReqId } = params ?? {}
    const allRequest = await this.getAllPendingRequests()
    allRequest.forEach((request) => {
      if (String(request.payload.id) === String(excludeReqId)) {
        return
      }
      ctx.responses.push({
        from: ctx.from,
        to: request.from,
        payload: constructJsonRpcResponse({
          id: request.payload.id,
          error: { code: 4001, message: 'rejected' },
        }),
      })
      // await PopupRequestModel.popupRequests.delete(request.payload.id)
    })
    // await Promise.all(promise)
    await PopupRequestModel.popupRequests
      .where('id')
      .notEqual(excludeReqId ?? 0)
      .delete()
    await SubscriptionManager.pushSubscriptionUpdate({
      path: POPUP_REQUEST_QUEUE_PATH,
    })
  },
}

export default PopupRequestService
