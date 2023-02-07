import { Provider } from './provider'

declare global {
  interface Window {
    ethereum?: Provider
    deficonnectProvider?: Provider
    deficonnect: { ethereum?: Provider }
  }
}

window.deficonnect = {
  ethereum: new Provider(),
}
// for SDK 2.0.X
window.deficonnectProvider = window.deficonnect.ethereum
if (!(window.ethereum && window.ethereum.isMetaMask)) {
  window.ethereum = window.deficonnectProvider
}

export {}
