import { WsProvider } from '@polkadot/api'
import keyring from '@polkadot/ui-keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'

import { createServer } from './app/server'
import Job from './job'
import Koa from './koa-ts'
import DappRequestMiddleware from './middleware/dapp.request.middleware'
import ErrorHandleMiddleware from './middleware/error.handle.middleware'
import RespondMiddleware from './middleware/respond.middleware'
import RouterMiddleware from './middleware/router.middleware'
import RpcResponseMiddleware from './middleware/rpc.response.middleware'

export const app = new Koa()
export let wsProvider: WsProvider

const middleware = [
  ErrorHandleMiddleware,
  RespondMiddleware, // do not change this middleware position
  DappRequestMiddleware, // do not change this middleware position
  RpcResponseMiddleware,
  RouterMiddleware, // do not change this middleware position
]
middleware.forEach((fn) => app.use(fn))
const handleRequest = app.listen()

export const server = createServer({
  requestListener: handleRequest,
  onInstalled: async (details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      // to do something
    }
  },
  beforeStart: async () => {
    await Job.startAllJobs()

    wsProvider = new WsProvider('wss://ws.calamari.seabird.systems')

    // initial setup
    cryptoWaitReady()
      .then((): void => {
        console.log('crypto initialized')

        // load all the keyring data// load all the keyring data
        keyring.loadAll({ ss58Format: 78, type: 'sr25519' })

        console.log('initialization completed')
      })
      .catch((error): void => {
        console.error('initialization failed', error)
      })
  },
  afterStart: async () => {},
})

export default {}
