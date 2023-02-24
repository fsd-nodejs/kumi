// Copyright 2019-2023 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0
import type {
  Signer as SignerInterface,
  SignerResult,
} from '@polkadot/api/types'
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types'

import { DappRpcClient } from '../connector/dapp-rpc-client'

// External to class, this.# is not private enough (yet)
let rpcClient: DappRpcClient
let nextId = 0

export default class Signer implements SignerInterface {
  constructor(_rpcClient: DappRpcClient) {
    rpcClient = _rpcClient
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const id = ++nextId
    const result = await rpcClient.sendRequest({
      method: 'pub(extrinsic.sign)',
      params: [payload],
    })

    // we add an internal id (number) - should have a mapping from the
    // extension id (string) -> internal id (number) if we wish to provide
    // updated via the update functionality (noop at this point)
    return {
      ...result,
      id,
    }
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    const id = ++nextId
    const result = await rpcClient.sendRequest({
      method: 'pub(bytes.sign)',
      params: [payload],
    })

    return {
      ...result,
      id,
    }
  }

  // NOTE We don't listen to updates at all, if we do we can interpret the
  // result as provided by the API here
  // public update (id: number, status: Hash | SubmittableResult): void {
  //   // ignore
  // }
}
