// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
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

  public subscribe(): Unsubcall {
    // let id: string | null = null

    // sendRequest('pub(accounts.subscribe)', null, cb)
    //   .then((subId): void => {
    //     id = subId
    //   })
    //   .catch(console.error)

    return (): void => {}
  }
}
