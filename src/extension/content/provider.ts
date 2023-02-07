import type { IJsonRpcRequest } from '@deficonnect/types'
import { getClientMeta } from '@walletconnect/utils'
import { isEqual } from 'lodash'

import type { IWalletConnectSessionWalletAddresses } from '@/extension'

import SafeEventEmitter from '../background/utils/safe-event-emitter'
import { dappAllowMethods } from '../common/constants'
import { ProviderRpcError } from '../common/error/rpc-error'
import type { NetworkConfig } from './connector/dapp-connect-client'
import { DappConnectClient } from './connector/dapp-connect-client'

interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export class Provider extends SafeEventEmitter {
  connectorClient: DappConnectClient
  networkConfig?: NetworkConfig
  isMetaMask = true
  private preAccounts?: string[] = []
  private preChainId?: string

  constructor() {
    super()
    this.connectorClient = new DappConnectClient()
    this.connectorClient.on('connect', () => {
      this.preAccounts = this.accounts
      this.preChainId = this.chainId
      this.emit('connect', { chainId: this.chainId, accounts: this.accounts })
    })
    this.connectorClient.on('disconnect', () => {
      this.preAccounts = this.accounts
      this.preChainId = this.chainId
      this.emit('accountsChanged', this.accounts)
      this.emit('disconnect', { code: 4900, message: 'disconnect' })
    })
    this.connectorClient.on('update', () => {
      if (!isEqual(this.preChainId, this.chainId)) {
        this.preChainId = this.chainId
        this.emit('chainChanged', this.chainId)
      }
      if (!isEqual(this.preAccounts, this.accounts)) {
        this.preAccounts = this.accounts
        this.emit('accountsChanged', this.accounts)
      }
    })
    this.connectorClient.rpcClient.on(
      'dc_requestDappClientMeta',
      (res: IJsonRpcRequest) => {
        const clientMeta = getClientMeta()
        this.connectorClient.rpcClient.sendResponse({
          requestId: res.id,
          result: clientMeta,
        })
      },
    )
  }
  get chainId() {
    if (this.chainType === 'eth') {
      return '0x' + Number(this.networkVersion).toString(16)
    } else {
      return this.connectorClient.session?.chainId ?? ''
    }
  }
  get networkVersion() {
    return this.connectorClient.session?.chainId ?? '1'
  }
  get accounts() {
    const accounts = this.connectorClient.session?.accounts ?? []
    return accounts.map((item) => item.toLocaleLowerCase())
  }
  get chainType() {
    return this.connectorClient.session?.chainType ?? 'eth'
  }

  async connectEagerly(network?: NetworkConfig): Promise<string[]> {
    if (this.accounts.length > 0) {
      return this.accounts
    }
    if (network) {
      this.networkConfig = network
    }
    return this.connectorClient.connectEagerly(this.networkConfig)
  }

  async connect(network?: NetworkConfig): Promise<string[]> {
    if (this.accounts.length > 0) {
      return this.accounts
    }
    if (network) {
      this.networkConfig = network
    }
    return this.connectorClient.connect({
      chainType: 'eth',
      ...this.networkConfig,
    } as NetworkConfig)
  }

  async enable(): Promise<string[]> {
    return this.connect()
  }
  async close(): Promise<void> {
    return this.connectorClient.disconnect()
  }

  get connected(): boolean {
    return this.accounts.length > 0
  }

  async send(methodOrPayload: any, callbackOrArgs?: any): Promise<any> {
    console.warn(
      `Kumi Extension: 'ethereum.send(...)' or 'ethereum.sendAsync(...)' is deprecated and may be removed in the future. Please use 'ethereum.request(...)' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    )
    if (
      typeof methodOrPayload === 'string' &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      const result = await this.request({
        method: methodOrPayload,
        params: callbackOrArgs,
      })
      return result
    } else if (
      methodOrPayload &&
      typeof methodOrPayload === 'object' &&
      typeof callbackOrArgs === 'function'
    ) {
      const { id, jsonrpc } = methodOrPayload
      try {
        const result = await this.request(methodOrPayload)
        const response = { result, id, jsonrpc }
        callbackOrArgs(null, response)
        return response
      } catch (error) {
        callbackOrArgs(error, { id, jsonrpc, error })
        return { id, jsonrpc, error }
      }
    }
  }

  async sendAsync(payload: any, callback?: any): Promise<any> {
    return this.send(payload, callback)
  }

  async request(args: RequestArguments): Promise<unknown> {
    const method = args.method
    switch (method) {
      case 'eth_requestAccounts':
        await this.connect()
        return this.accounts
      case 'eth_chainId':
        await this.connectEagerly()
        return this.chainId
      case 'eth_accounts':
        await this.connectEagerly()
        return this.accounts
      case 'wallet_getAllAccounts':
        await this.connectEagerly(this.networkConfig)
        return this.wallet_getAllAccounts()
      case 'net_version':
        await this.connectEagerly()
        return this.connectorClient.session?.chainId
      case 'eth_newFilter':
      case 'eth_newBlockFilter':
      case 'eth_newPendingTransactionFilter':
      case 'eth_uninstallFilter':
      case 'eth_subscribe':
        throw new ProviderRpcError(
          4200,
          `not support calling ${method}. Please use your own solution`,
        )
    }
    if (dappAllowMethods.includes(args.method)) {
      return this.connectorClient.rpcClient.sendRequest({
        method: args.method,
        params: args.params as any,
      })
    }
    if (method.startsWith('cosmos_')) {
      return this.connectorClient.rpcClient.sendRequest({
        method: 'cosmos_proxyJsonRpcRequest',
        params: [args],
      })
    } else {
      return this.connectorClient.rpcClient.sendRequest({
        method: 'eth_proxyJsonRpcRequest',
        params: [args],
      })
    }
  }
  private async wallet_getAllAccounts(): Promise<IWalletConnectSessionWalletAddresses> {
    const session = this.connectorClient.session
    const wallet = session?.wallets.find(
      (w) => w.id === session?.selectedWalletId,
    )
    if (!wallet) {
      throw new Error('can not find address for special chainId')
    }
    return wallet.addresses
  }
}
