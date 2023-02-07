import { cryptoWaitReady } from '@polkadot/util-crypto'

import { createServer } from './app/server'
import Job from './job'
import Koa from './koa-ts'
import ErrorHandleMiddleware from './middleware/error.handle.middleware'
import RespondMiddleware from './middleware/respond.middleware'
import RouterMiddleware from './middleware/router.middleware'
import RpcResponseMiddleware from './middleware/rpc.response.middleware'

export const app = new Koa()

const middleware = [
  ErrorHandleMiddleware,
  RespondMiddleware, // do not change this middleware position
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

    // initial setup
    cryptoWaitReady()
      .then((): void => {
        console.log('crypto initialized')

        // load all the keyring data

        console.log('initialization completed')
      })
      .catch((error): void => {
        console.error('initialization failed', error)
      })
  },
  afterStart: async () => {},
})

export default {}
