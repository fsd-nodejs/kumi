import type {
  IJsonRpcRequest,
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
} from '@deficonnect/types'

import type { KoaMessage } from './background/koa-ts/lib/message'

export type ClientRole = 'popup' | 'dapp' | 'mobile' | 'unknown'

export interface WSMessage {
  type: 'pub' | 'sub' | 'ack'
  payload: string
  silent: boolean
  topic: string
  rpc_id?: number
  rpc_method?: string
  from?: 'dapp' | 'extension' | 'mobile'
  name?: string
  origin?: string
  push_topic?: string
  break_topic?: string
  client_uuid?: string // this is the mobile side device_id
}

export interface ChromeConnectPortJSON {
  role: ClientRole
  origin: string
  uuid: string
}

export type IJsonRpcMessage = IJsonRpcResponse | IJsonRpcRequest

export type IJsonRpcResponse = IJsonRpcResponseSuccess | IJsonRpcResponseError

export interface ProxyRequest {
  type: 'defi-connector-proxy-request'
  payload: KoaMessage
}

export interface ProxyRequestResponse {
  type: 'defi-connector-proxy-request-response'
  payload: KoaMessage
}

export interface AddEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export interface AddEthereumChainByPopupParameter {
  networkId?: string
  chainId: string
  networkName: string
  rpcUrl: string
  symbol: string
  explorer: string
  decimals: string
}

export interface WatchAssetParams {
  type: 'ERC20'
  options: {
    address: string
    symbol: string
    decimals: number
    image: string
  }
}

export interface IClientMeta {
  description: string
  url: string
  icons: string[]
  name: string
}

export interface IWalletConnectSessionWalletAdress {
  address: string
  algo?: string ////"secp256k1" | "ed25519" | "sr25519"
  pubkey?: string
}

export type IWalletConnectSessionWalletAddresses = Record<
  string,
  IWalletConnectSessionWalletAdress
>

export interface IWalletConnectSessionWallet {
  id: string
  name: string
  icon: string
  addresses: IWalletConnectSessionWalletAddresses
}

export interface ISessionParams {
  approved: boolean
  chainId: string | null
  chainType: string | null
  accounts: string[] | null
  rpcUrl?: string | null
  peerId?: string | null
  peerMeta?: IClientMeta | null
  selectedWalletId: string | null
  wallets: IWalletConnectSessionWallet[]
}

export interface IDiscoverApp {
  explorers: IDiscoverExplorer[]
}

export interface IDiscoverExplorer {
  backgroundImage: string
  chainId: string
  content: string
  explorer: string
  iconUrl: string
  rpcUrl: string
  title: string
}
