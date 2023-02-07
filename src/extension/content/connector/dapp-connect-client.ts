import type { IJsonRpcRequest } from '@deficonnect/types'
import { getClientMeta } from '@walletconnect/utils'

import SafeEventEmitter from '@/extension/background/utils/safe-event-emitter'

import type { ISessionParams } from '@/extension'

import { DappRpcClient } from './dapp-rpc-client'

export interface EthNetworkConfig {
  name: string
  chainType: 'eth'
  chainId: string
  rpcUrl: string
  symbol: string
  explorer?: string
}

export interface CosmosNetworkConfig {
  name: string
  chainType: 'cosmos'
  chainId: string
  rpcUrl: string
  symbol: string
  explorer?: string

  denom: string
  bip44: {
    coinType: number
  }
}

export interface AptosNetworkConfig {
  name: string
  chainType: 'aptos'
  chainId: string
  rpcUrl: string
  symbol: string
  explorer?: string
}

export type NetworkConfig =
  | EthNetworkConfig
  | CosmosNetworkConfig
  | AptosNetworkConfig

export class DappConnectClient extends SafeEventEmitter {
  session?: ISessionParams
  rpcClient: DappRpcClient
  constructor() {
    super()
    this.rpcClient = new DappRpcClient()

    this.rpcClient.on('dc_sessionUpdate', (rpc: IJsonRpcRequest) => {
      const session = rpc.params[0]
      if (session && session.approved) {
        if (!this.session?.approved) {
          this.session = session
          this.emit('connect', session)
        }
        this.session = session
        this.emit('update', session)
      } else {
        this.session = session
        this.emit('disconnect')
        this.emit('update', session)
      }
    })
    this.rpcClient.on('dapp_pong', () => {
      console.log('test dapp_pong')
      this.rpcClient.sendRequest({
        method: 'dapp_ping',
      })
    })
  }

  async connectEagerly(network?: NetworkConfig): Promise<string[]> {
    if (this.session) return this.session.accounts ?? []
    try {
      const result = await this.rpcClient.sendRequest({
        method: 'dc_sessionInit',
        params: [network],
      })
      this.session = result
      this.emit('connect', result)
      this.emit('update', result)
    } catch {}
    return this.session?.accounts ?? []
  }

  async connect(network?: NetworkConfig): Promise<string[]> {
    const result = await this.rpcClient.sendRequest({
      method: 'dc_sessionRequest',
      params: [{ ...network, peerMeta: getClientMeta() }],
    })
    if (result) {
      this.session = result
      this.emit('connect', result)
      this.emit('update', result)
    }
    return this.session?.accounts ?? []
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      this.session = {
        approved: false,
        chainId: this.session.chainId,
        chainType: this.session.chainType,
        accounts: [],
        wallets: [],
        selectedWalletId: null,
      }
    }
    this.emit('disconnect')
    this.emit('update', this.session)
    return this.rpcClient.sendRequest({
      method: 'dc_sessionUpdate',
      params: [
        {
          approved: false,
        },
      ],
    })
  }
}
