export const ethSigningMethods = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v2',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'personal_sign',
]

export const KOA_MESSAGE_MOBILE_ORIGIN = 'wss://mobile.defiwallet'
export const allSigningMethods = [
  ...ethSigningMethods,
  'cosmos_sendTransaction',
  'cosmos_signDirect',
]
export const aptosAutoPopupMethos = [
  'aptos_signAndSubmitTransaction',
  'aptos_signTransaction',
  'aptos_signMessage',
  'aptos_signTransactionMartian',
  'aptos_signAndSubmitTransactionMartian',
  'aptos_generateSignAndSubmitTransaction',
  'aptos_signGenericTransaction',
  'aptos_createCollection',
  'aptos_createToken',
]
export const dappAutoPopupMethods = [
  ...allSigningMethods,
  ...aptosAutoPopupMethos,
]
export const dappAllowMethods = [
  ...dappAutoPopupMethods,
  ...aptosAutoPopupMethos,
  'dapp_ping',
  'dc_sessionRequest',
  'dc_sessionUpdate',
  'dc_sessionInit',
  'eth_proxyJsonRpcRequest',
  'cosmos_getAccounts',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_watchAsset',
  'aptos_generateTransaction',
  'aptos_submitTransactionMartian',
  'aptos_getAccount',
  'aptos_getChainId',
  'aptos_getLedgerInfo',
  'aptos_getTransactions',
  'aptos_getTransactionByHash',
  'aptos_getAccountTransactions',
  'aptos_getAccountResources',
]

export const ETH_EVENT_LOG_SIGNATURE = {
  transfer:
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  withdraw:
    '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
  nameRegistered:
    '0x69e37f151eb98a09618ddaa80c8cfaf1ce5996867c489f45b555b412271ebf27',
}

export const ETH_METHOD_SIGNATURE = {
  transfer: '0xa9059cbb',
  approve: '0x095ea7b3',
}

interface IPROTOCOL extends Record<string, any> {
  aptos: {
    default: string
  }
  eth: {
    default: string
    unknown: string
  }
  cosmos: {
    default: string
  }
}

export const PROTOCOL: IPROTOCOL = {
  aptos: {
    default: '0x1::coin::CoinStore',
  },
  eth: {
    default: 'erc-20',
    unknown: 'unknown',
  },
  cosmos: {
    default: '',
  },
}

export const APTOS_INFO = {
  nativeContractAddress: '0x1::aptos_coin::AptosCoin',
  withdrawEvent: '0x1::coin::WithdrawEvent',
  depositEvent: '0x1::coin::DepositEvent',
}

export const APTOS_TYPE: Record<string, string> = {
  '0x1::aptos_account::transfer': 'transfer',
  '0x1::coin::transfer': 'transfer',
  '0x1::managed_coin::register': 'register',
}
