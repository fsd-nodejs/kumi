import { uuid } from '@deficonnect/utils'
import keyring from '@polkadot/ui-keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import assert from 'assert'

import WalletModel from '../model/wallet.model'

const WalletService = {
  async createSeed(seed?: string) {
    const newSeed = seed ?? mnemonicGenerate()
    return {
      address: keyring.createFromUri(newSeed).address,
      seed: newSeed,
    }
  },
  async createAccount(params: {
    name: string
    network: number
    keyringId: number
    address: string
  }) {
    const { name, network, address, keyringId } = params

    const wallet = await WalletModel.wallets
      .where('address')
      .equals(address)
      .first()

    assert(!wallet, 'Existed same wallet')

    const accountId = await WalletModel.wallets.add({
      walletId: uuid(),
      name,
      network,
      address,
      keyringId,
      walletType: 'mnemonic',
      createTime: Date.now(),
    })

    return accountId
  },

  async getWalletById(id: number) {
    return WalletModel.wallets.where('id').equals(id).first()
  },
  async getWalletByAddress(address: string) {
    return WalletModel.wallets.where('address').equals(address).first()
  },

  async queryAllAccount() {
    const accounts = await (await WalletModel.wallets.toArray()).reverse()
    return accounts
  },

  async deleteAccount(address: string) {
    const deleted = WalletModel.wallets
      .where('address')
      .equals(address)
      .delete()
    return deleted
  },
}

export default WalletService
