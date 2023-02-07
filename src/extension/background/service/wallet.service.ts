import { mnemonicGenerate } from '@polkadot/util-crypto'

const WalletService = {
  async createSeed() {
    const seed = mnemonicGenerate()

    return {
      // address: keyring.createFromUri(seed).address,
      seed,
    }
  },
}

export default WalletService
