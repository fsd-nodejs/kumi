import { mnemonicValidate } from '@polkadot/util-crypto'
import assert from 'assert'

import BalanceService from '../service/balance.service'
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

    const wallet = await WalletService.getWalletById(accountId)
    if (wallet) {
      BalanceService.refreshBalance(wallet)
    }

    return ctx.pushResponse({ accountId })
  },

  async wallet_queryAllAccount(ctx: KoaContext) {
    const accounts = await WalletService.queryAllAccount()

    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await BalanceService.queryByAddressFromCache(
          account.address,
        )
        return { ...account, balance }
      }),
    )

    return ctx.pushResponse(accountsWithBalance)
  },

  async wallet_deleteAccount(ctx: KoaContext<[{ address: string }]>) {
    const { address } = ctx.params[0]
    assert(address, 'Invalid address')

    const deleted = await WalletService.deleteAccount(address)

    await BalanceService.deleteBalance(address)

    assert(deleted, 'Delete Account Failed')

    return ctx.pushResponse(deleted)
  },
}

export default WalletController
