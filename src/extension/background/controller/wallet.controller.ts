import { mnemonicValidate } from '@polkadot/util-crypto'
import assert from 'assert'

import KeyringService from '../service/keyring.service'
import WalletService from '../service/wallet.service'
import { KoaContext } from './../koa-ts/lib/context'

const WalletController = {
  async wallet_createSeed(ctx: KoaContext<[{ seed?: string }]>) {
    const { seed } = ctx.params[0]
    if (seed) {
      assert(mnemonicValidate(seed), 'Not a valid mnemonic seed')
    }
    const result = await WalletService.createSeed(seed)
    return ctx.pushResponse(result)
  },

  async wallet_createAccount(
    ctx: KoaContext<
      [
        {
          name: string
          network: number
          password: string
          seed: string
        },
      ]
    >,
  ) {
    const { name, network, password, seed } = ctx.params[0]
    assert(name, 'Missing name')
    assert(network, 'Missing network')
    assert(password, 'Missing password')

    assert(mnemonicValidate(seed), 'Not a valid mnemonic seed')

    const account = await WalletService.createSeed(seed)

    const keyringId = await KeyringService.createMnemonic(password, seed)

    const accountId = await WalletService.createAccount({
      name,
      network,
      keyringId,
      address: account.address,
    })

    return ctx.pushResponse({ accountId })
  },

  async wallet_queryAllAccount(ctx: KoaContext) {
    const accounts = await WalletService.queryAllAccount()
    return ctx.pushResponse(accounts)
  },
}

export default WalletController
