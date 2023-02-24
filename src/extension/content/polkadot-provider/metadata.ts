// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from '@polkadot/extension-inject/types'

import { DappRpcClient } from '../connector/dapp-rpc-client'

let rpcClient: DappRpcClient

// External to class, this.# is not private enough (yet)

export default class Metadata implements InjectedMetadata {
  constructor(_rpcClient: DappRpcClient) {
    rpcClient = _rpcClient
  }

  public get(): Promise<InjectedMetadataKnown[]> {
    return rpcClient.sendRequest({ method: 'pub(metadata.list)' })
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    return rpcClient.sendRequest({
      method: 'pub(metadata.provide)',
      params: [definition],
    })
  }
}
