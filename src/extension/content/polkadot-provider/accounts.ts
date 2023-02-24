// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { IJsonRpcRequest } from '@deficonnect/types'
import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from '@polkadot/extension-inject/types'

import { DappRpcClient } from '../connector/dapp-rpc-client'

// External to class, this.# is not private enough (yet)
let rpcClient: DappRpcClient

export default class Accounts implements InjectedAccounts {
  constructor(_rpcClient: DappRpcClient) {
    rpcClient = _rpcClient
  }

  public get(anyType?: boolean): Promise<InjectedAccount[]> {
    return rpcClient.sendRequest({
      method: 'pub(accounts.list)',
      params: [{ anyType: Boolean(anyType) }],
    })
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    // let id: string | null = null;
    console.log('test bb')
    const callback = (request: IJsonRpcRequest) => {
      console.log('test aa')
      if (request.params[0].path !== 'pub(accounts.subscribe)') {
        return
      }
      cb(request.params[0].data)
    }
    rpcClient.on('subscribe_update', callback)
    rpcClient
      .sendRequest({
        method: 'subscribe_register',
        params: [
          {
            path: 'pub(accounts.subscribe)',
          },
        ],
      })
      .catch(() => {
        // ignore
        return undefined
      })

    return (): void => {
      rpcClient.removeListener('subscribe_update', cb)
    }
  }
}
