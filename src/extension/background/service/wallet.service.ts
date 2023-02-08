import keyring from '@polkadot/ui-keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto'

const WalletService = {
  async createSeed(seed?: string) {
    const newSeed = seed ?? mnemonicGenerate()
    return {
      address: keyring.createFromUri(newSeed).address,
      seed: newSeed,
    }
  },
}

export default WalletService
