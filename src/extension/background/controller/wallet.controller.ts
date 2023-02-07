import { mnemonicValidate } from '@polkadot/util-crypto'
import assert from 'assert'

import WalletService from '../service/wallet.service'
import { KoaContext } from './../koa-ts/lib/context'

const WalletController = {
  async wallet_createSeed(ctx: KoaContext<[{ seed: string }]>) {
    const { seed } = ctx.params[0]
    if (seed) {
      assert(mnemonicValidate(seed), 'Not a valid mnemonic seed')
    }
    const result = await WalletService.createSeed(seed)
    return ctx.pushResponse(result)
  },
}

export default WalletController
