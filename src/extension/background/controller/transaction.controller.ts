import assert from 'assert'

import { KoaContext } from '../koa-ts'
import BalanceService from '../service/balance.service'
import KeyringService from '../service/keyring.service'
import TransactionService from '../service/transaction.service'
import WalletService from '../service/wallet.service'
import { isValidAddressPolkadotAddress } from '../utils/validate.address'

const TransactionController = {
  async transaction_sendTransaction(
    ctx: KoaContext<
      [
        {
          password: string
          sender: string
          amount: number
          recipient: string
        },
      ]
    >,
  ) {
    const { sender, recipient, amount, password } = ctx.params[0]

    console.log('test', ctx.params[0])

    assert(sender, 'Sender must be specified')
    assert(recipient, 'Recipient must be specified')
    assert(amount > 0, 'Amount must be greater than zero')
    assert(password, 'Password must be specified')

    const isValid = isValidAddressPolkadotAddress(recipient)
    assert(isValid, 'Invalid address')

    const account = await WalletService.getWalletByAddress(sender)
    assert(account, 'Account not found')

    const seed = await KeyringService.getMnemonic(password, account.keyringId)
    assert(seed, 'Password not correct!')

    const tx = await TransactionService.sendTransaction({
      sender,
      amount,
      recipient,
      seed,
    })

    await BalanceService.refreshTransactionBalance(sender, recipient)

    return ctx.pushResponse({ tx: tx.toHex() })
  },
}

export default TransactionController
