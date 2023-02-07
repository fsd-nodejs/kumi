import WalletService from '../service/wallet.service'
import { KoaContext } from './../koa-ts/lib/context'

const WalletController = {
  async wallet_createSeed(ctx: KoaContext) {
    const result = await WalletService.createSeed()
    return ctx.pushResponse(result)
  },
}

export default WalletController
