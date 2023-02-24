// subscription.ts
import type { IJsonRpcRequest } from '@deficonnect/types'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useState } from 'react'

import { rpcClient } from '@/services/rpc-client'

import type { KoaReqMessage } from '@/extension/background/koa-ts/lib/message'
import { Wallet } from '@/extension/background/model/wallet.model'

export const useSubscription = <T>(path: string): [T | undefined, boolean] => {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [memoValue, setMemoValue] = useState<T | undefined>(undefined)
  const [initialed, setInitialed] = useState<boolean>(false)
  const [reconnect, setReconnect] = useState(Symbol())
  useEffect(() => {
    rpcClient.on('reconnect', () => setReconnect(Symbol()))
  }, [])

  useEffect(() => {
    const callback = (request: IJsonRpcRequest) => {
      if (request.params[0].path !== path) {
        return
      }
      setValue(request.params[0].data)
      setInitialed(true)
    }
    rpcClient.on('subscribe_update', callback)
    rpcClient
      .sendRequest({
        method: 'subscribe_register',
        params: [
          {
            path,
          },
        ],
      })
      .catch(() => {
        // ignore
        return undefined
      })

    return () => {
      rpcClient.removeListener('subscribe_update', callback)
    }
  }, [path, reconnect])
  useDeepCompareEffect(() => {
    setMemoValue(value)
  }, [value, reconnect])
  return [memoValue, initialed]
}

export const useSubscribePopupRequest = () => {
  return useSubscription<KoaReqMessage[]>('popup.uiRequestQueue')
}

export const useSubscribeWallets = () => {
  return useSubscription<Wallet[]>('popup.wallets')
}
