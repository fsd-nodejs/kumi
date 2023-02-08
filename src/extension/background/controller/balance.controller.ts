import assert from 'assert'

import BalanceService from '../service/balance.service'
import { KoaContext } from './../koa-ts/lib/context'

const BalanceController = {
  async balance_queryByAddress(ctx: KoaContext<[{ address: string }]>) {
    const { address } = ctx.params[0]
    assert(address, 'Missing address')

    const balance = await BalanceService.queryByAddress(address)
    return ctx.pushResponse({ balance })
  },
}

export default BalanceController
