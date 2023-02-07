import { uuid } from '@walletconnect/utils'

import type { ChromeConnectPortJSON, ProxyRequest } from '..'
import { isKoaMessage } from '../background/utils/types-utils'

declare global {
  interface Window {
    cryptoExtentionGeneratorProvider?: any
  }
}

function injectScript() {
  try {
    const container = document.head || document.documentElement
    const injectScrits = ['inpage-content.js']
    const importScript = (uri: string) => {
      const scriptTag = document.createElement('script')
      scriptTag.src = chrome.runtime.getURL(uri)
      scriptTag.type = 'text/javascript'
      container.insertBefore(scriptTag, container.children[0])
      scriptTag.remove()
    }
    injectScrits.forEach(importScript)
  } catch (error) {
    console.error(
      'DeFi Crypto.com Wallet Extension: Provider injection failed.',
      error,
    )
  }
}

injectScript()

class ContentScript {
  _port?: chrome.runtime.Port

  start = () => {
    this._port = this.connectServiceWorker()
    window.addEventListener('message', this._receiveMessageFromWeb)
  }

  _receiveMessageFromWeb = (e: any) => {
    const request: ProxyRequest = e.data
    if (request?.type !== 'defi-connector-proxy-request') {
      return
    }
    if (isKoaMessage(request.payload)) {
      this._port?.postMessage(request.payload || {})
    }
  }

  connectServiceWorker() {
    const nameJSON: ChromeConnectPortJSON = {
      role: 'dapp',
      origin: location.origin,
      uuid: uuid(),
    }
    const port = chrome.runtime.connect({ name: JSON.stringify(nameJSON) })
    port.onDisconnect.addListener(() => {
      setTimeout(() => {
        this.connectServiceWorker()
      }, 1000)
    })
    this._port = port
    this._port.onMessage.addListener((message) => {
      window.postMessage(
        {
          type: 'defi-connector-proxy-request-response',
          payload: message,
        },
        location.origin,
      )
    })
    return port
  }
}

const contentScript = new ContentScript()
contentScript.start()

export default contentScript
