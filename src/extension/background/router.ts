import DappController from './controller/dapp.controller'
import ExampleController from './controller/example.controller'
import { KoaContext } from './koa-ts'

const routers = {
  ...ExampleController,
  ...DappController,
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
