import assert from 'assert'

import KeyringModel from '../model/keyring.model'
import { decrypt, encrypt } from '../utils/crypto-utils'

const KeyringService = {
  async createMnemonic(password: string, mnemonic: string) {
    const encryptedText = await encrypt(password, mnemonic)
    const buffer = Buffer.from(encryptedText)
    return KeyringModel.keyrings.add({ buffer })
  },
  async getMnemonic(password: string, id = 1) {
    const keyring = await KeyringModel.keyrings.get({ id })
    assert(keyring, `Not found this keyring by id: ${id}`)
    const encryptedText = new TextDecoder().decode(keyring.buffer)
    return decrypt<string>(password, encryptedText)
  },

  async deleteMnemonic(id = 1) {
    return KeyringModel.keyrings.delete(id)
  },
}

export default KeyringService
