import {
  dappAutoPopupMethods,
  dappAllowMethods,
} from '@/extension/common/constants'

import type { KoaContext } from '../koa-ts'
import type { IRouters } from '../router'
import PopupRequestService from '../service/popup.request.service'
import { DefaultPopupManager } from '../utils/extension-tools/popup-tool'

const checkNeedPopupUIForRequests = async (
  ctx: KoaContext,
): Promise<boolean> => {
  const request = ctx.rpcReq
  const method = (request?.method ?? '') as IRouters
  const needPopupUI =
    dappAutoPopupMethods.includes(method) && ctx.req.sess.role === 'dapp'
  if (!needPopupUI) {
    return false
  }
  await PopupRequestService.addRequestToQueue(ctx)
  await DefaultPopupManager.showPopup(chrome.runtime.getURL('index.html#'))
  return true
}
// TODO limit dapp request if disconnected
const checkAccessForDappRequests = (ctx: KoaContext): boolean => {
  const method = (ctx.rpcReq?.method ?? '') as IRouters
  if (ctx.req.sess.role === 'dapp' && !dappAllowMethods.includes(method)) {
    console.warn(`no access to call ${method} from ${ctx.req.sess.role}`)
    return false
  }
  return true
}

/**
 * process the request from dapp side, such as popup a UI for sign or connect request.
 * filter the Illegal request from web side.
 */
const DappRequestMiddleware = async (
  ctx: KoaContext,
  next: () => Promise<any>,
) => {
  const needStubRequest = await checkNeedPopupUIForRequests(ctx)
  if (!needStubRequest && checkAccessForDappRequests(ctx)) {
    await next()
  }
}
export default DappRequestMiddleware
