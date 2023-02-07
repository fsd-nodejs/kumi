import {
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
} from '@deficonnect/utils'

import { KOA_MESSAGE_MOBILE_ORIGIN } from '@/extension/common/constants'

import type {
  ClientRole,
  IJsonRpcMessage,
  IJsonRpcResponse,
  WSMessage,
} from '@/extension'

import type { KoaMessage, KoaReqMessage } from '../koa-ts'

export function isJsonRpcResponse(object: any): object is IJsonRpcResponse {
  return isJsonRpcResponseSuccess(object) || isJsonRpcResponseError(object)
}

export function isJsonRpcMessage(object: any): object is IJsonRpcMessage {
  return isJsonRpcRequest(object) || isJsonRpcResponse(object)
}

export function isKoaMessage(object: any): object is KoaMessage {
  return (
    !!object &&
    typeof object.from === 'string' &&
    typeof object.to === 'string' &&
    isJsonRpcMessage(object.payload)
  )
}
export function isKoaReqMessage(object: any): object is KoaReqMessage {
  return (
    !!object &&
    typeof object.from === 'string' &&
    typeof object.to === 'string' &&
    isJsonRpcRequest(object.payload)
  )
}

export function isWSMessage(object: any): object is WSMessage {
  return (
    !!object &&
    typeof object.type !== 'undefined' &&
    typeof object.topic !== 'undefined' &&
    typeof object.payload !== 'undefined'
  )
}

export function isBrowserRuntimePort(
  object: any,
): object is chrome.runtime.Port {
  return (
    typeof object.name === 'string' &&
    typeof object.postMessage === 'function' &&
    typeof object.onMessage !== 'undefined' &&
    typeof object.onDisconnect !== 'undefined' &&
    typeof object.disconnect !== 'undefined'
  )
}

export function isExtensionClientPort(port: chrome.runtime.Port): boolean {
  return port.sender?.origin?.startsWith('chrome-extension://') ?? false
}

export function roleOfOriginUrl(origin: string): ClientRole {
  if (origin === location.origin || origin === 'http://localhost:8000') {
    return 'popup'
  } else if (origin === KOA_MESSAGE_MOBILE_ORIGIN) {
    return 'mobile'
  } else {
    return 'dapp'
  }
}

export function roleOfExtensionClientPort(
  port: chrome.runtime.Port,
): ClientRole {
  const origin = port.sender?.origin
  if (origin) {
    return roleOfOriginUrl(origin)
  } else {
    return 'unknown'
  }
}
