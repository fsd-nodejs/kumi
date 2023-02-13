import type { Injected } from '@polkadot/extension-inject/types'

import SafeEventEmitter from '@/extension/background/utils/safe-event-emitter'

import { DappConnectClient } from '../connector/dapp-connect-client'
import Accounts from './accounts'
import Metadata from './metadata'
import PostMessageProvider from './post.message.provider'
import Signer from './signer'

export class PolkadotProvider extends SafeEventEmitter implements Injected {
  connectorClient: DappConnectClient
  public readonly accounts: Accounts

  public readonly metadata: Metadata

  public readonly provider: PostMessageProvider

  public readonly signer: Signer
  constructor() {
    super()
    this.connectorClient = new DappConnectClient()

    this.accounts = new Accounts(this.connectorClient.rpcClient)
    this.metadata = new Metadata(this.connectorClient.rpcClient)
    this.provider = new PostMessageProvider(this.connectorClient.rpcClient)
    this.signer = new Signer(this.connectorClient.rpcClient)

    // setInterval((): void => {
    //   sendRequest('pub(ping)', null).catch((): void => {
    //     console.error('Extension unavailable, ping failed');
    //   });
    // }, 5_000 + Math.floor(Math.random() * 5_000));
  }
}
