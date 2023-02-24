import BalanceController from './controller/balance.controller'
import DappController from './controller/dapp.controller'
import DCController from './controller/dc.controller'
import ExampleController from './controller/example.controller'
import PubController from './controller/pub.controller'
import SubscribeController from './controller/subscribe.controller'
import TransactionController from './controller/transaction.controller'
import WalletController from './controller/wallet.controller'
import { KoaContext } from './koa-ts'

const routers = {
  ...ExampleController,
  ...DappController,
  ...WalletController,
  ...BalanceController,
  ...TransactionController,
  ...PubController,
  ...SubscribeController,
  ...DCController,
}

export type IRouters = keyof typeof routers

export type GetResponseType<T extends IRouters> = GetResult<
  Awaited<ReturnType<(typeof routers)[T]>>
>['result']

type GetResult<T> = T extends void ? { result: void } : T

type GetKoaGeneric<T> = T extends KoaContext<infer P> ? P : never

export type GetParameters<T extends IRouters> = GetKoaGeneric<
  Parameters<(typeof routers)[T]>[0]
>

export default routers
