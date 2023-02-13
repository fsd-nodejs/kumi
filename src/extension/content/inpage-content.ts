import type { Injected } from '@polkadot/extension-inject/types'

import { PolkadotProvider } from './polkadot-provider'
import { Provider } from './provider'

declare global {
  interface Window {
    ethereum?: Provider
    deficonnectProvider?: Provider
    deficonnect: { ethereum?: Provider }
    injectedWeb3: {
      'crypto-js': {
        version: string
        enable: (originName: string) => Promise<Injected>
      }
    }
  }
}

// window.deficonnect = {
//   ethereum: new Provider(),
// }
// for SDK 2.0.X
// window.deficonnectProvider = window.deficonnect.ethereum
// if (!(window.ethereum && window.ethereum.isMetaMask)) {
//   window.ethereum = window.deficonnectProvider
// }

// the enable function, called by the dapp to allow access
export async function enable(origin: string): Promise<Injected> {
  const injected = new PolkadotProvider()
  await injected.connectorClient.rpcClient.sendRequest({
    method: 'pub(authorize.tab)',
    params: [{ origin }],
  })
  return injected
}

window.injectedWeb3 = {
  // this is the name for this extension, there could be multiples injected,
  // each with their own keys, here `polkadot-js` is for this extension
  'crypto-js': {
    // semver for the package
    version: '0.1.0',

    // this is called to enable the injection, and returns an injected
    // object containing the accounts, signer and provider interfaces
    // (or it will reject if not authorized)
    enable: (origin) => enable(origin),
  },
}

export {}
