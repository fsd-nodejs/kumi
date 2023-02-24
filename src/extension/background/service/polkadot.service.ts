import { ApiPromise } from '@polkadot/api'
import { Keyring } from '@polkadot/api'
import type { SignerPayloadJSON } from '@polkadot/types/types'

import { wsProvider } from '../bootstrap'

const PolkadotService = {
  async signPayload(payload: SignerPayloadJSON, seed: string) {
    const api = await ApiPromise.create({ provider: wsProvider }) // const txU8a = txPayload.toU8a()
    const keyring = new Keyring({ type: 'sr25519' })
    const pair = keyring.createFromUri(seed)
    return api.registry
      .createType('ExtrinsicPayload', payload, {
        version: payload.version,
      })
      .sign(pair)
  },
}

export default PolkadotService
