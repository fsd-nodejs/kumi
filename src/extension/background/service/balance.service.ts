import { ApiPromise } from '@polkadot/api'

import { wsProvider } from '../bootstrap'
import BalanceModel, { Balance } from '../model/balance.model'
import { Wallet } from '../model/wallet.model'
import { TokenMap } from './../model/balance.model'

const BalanceService = {
  async queryByAddressFromCache(address: string) {
    return BalanceModel.balances.where('address').equals(address).first()
  },
  async queryByAddress(address: string) {
    const api = await ApiPromise.create({ provider: wsProvider })
    const { data: balance } = await api.query.system.account(address)

    return balance
  },

  async refreshBalance(wallet: Wallet) {
    const balance = await this.queryByAddress(wallet.address)

    const existed = await BalanceModel.balances
      .where('address')
      .equals(wallet.address)
      .first()
    const params: Balance = {
      walletId: wallet.walletId,
      address: wallet.address,
      balance: `${balance.free}`,
      decimals: TokenMap.KMA.decimals,
      symbol: TokenMap.KMA.symbol,
    }
    if (existed) {
      params.id = existed.id
    }
    const updated = await BalanceModel.balances.put(params)
    return updated
  },

  async deleteBalance(address: string) {
    return BalanceModel.balances.where('address').equals(address).delete()
  },
}

export default BalanceService
