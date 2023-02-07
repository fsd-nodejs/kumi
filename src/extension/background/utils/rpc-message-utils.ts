import type { IJsonRpcResponse } from '@/extension'

export const constructJsonRpcResponse = (params: {
  id: number
  result?: any
  error?: any
}): IJsonRpcResponse => {
  if (params.error) {
    return {
      id: params.id,
      jsonrpc: '2.0',
      error: params.error,
    }
  }
  return {
    id: params.id,
    jsonrpc: '2.0',
    result: params.result,
  }
}
