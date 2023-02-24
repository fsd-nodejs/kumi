import assert from 'assert'

import BalanceService from '../service/balance.service'
import WalletService from '../service/wallet.service'
import { KoaContext } from './../koa-ts/lib/context'

const BalanceController = {
  async balance_refreshBalance(ctx: KoaContext<[{ address: string }]>) {
    const { address } = ctx.params[0]
    assert(address, 'Missing address')

    const wallet = await WalletService.getWalletByAddress(address)
    assert(wallet, 'Wallet not found')

    const balance = await BalanceService.refreshBalance(wallet)
    return ctx.pushResponse({ balance })
  },
}

export default BalanceController
