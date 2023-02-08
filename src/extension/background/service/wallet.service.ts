import { uuid } from '@deficonnect/utils'
import keyring from '@polkadot/ui-keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto'

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

  async queryAllAccount() {
    const accounts = await WalletModel.wallets.toArray()
    return accounts
  },
}

export default WalletService
