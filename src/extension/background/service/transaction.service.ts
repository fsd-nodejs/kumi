import { ApiPromise } from '@polkadot/api'
import { Keyring } from '@polkadot/api'
import * as Mathjs from 'mathjs'

import { wsProvider } from '../bootstrap'
import { TokenMap } from './../model/balance.model'

const TransactionService = {
  async sendTransaction(params: {
    sender: string
    /** Do not format amount, will auto handle decimals on this function */
    amount: number
    recipient: string
    seed: string
  }) {
    const { amount, recipient, sender, seed } = params
    const api = await ApiPromise.create({ provider: wsProvider })
    const keyring = new Keyring({ type: 'sr25519' })
    const newPair = keyring.addFromUri(seed)

    const formattedAmount = await this.formatAmountWithKMA(amount)

    const { nonce } = await api.query.system.account(sender)

    const tx = await api.tx.balances
      .transfer(recipient, formattedAmount)
      .signAndSend(newPair, { nonce })
    return tx
  },

  async formatAmountWithKMA(amount: number) {
    return Mathjs.bignumber(amount)
      .mul(Mathjs.bignumber(10).pow(TokenMap['KMA'].decimals))
      .toNumber()
  },
}

export default TransactionService
