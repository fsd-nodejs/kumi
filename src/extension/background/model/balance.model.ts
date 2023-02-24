import type { Table } from 'dexie'
import Dexie from 'dexie'

export interface Balance {
  id?: number
  walletId: string
  address: string
  symbol: string
  decimals: number
  balance: string
}

export const TokenMap = {
  KMA: {
    decimals: 12,
    symbol: 'KMA',
  },
  DOL: {
    decimals: 10,
    symbol: 'DOL',
  },
}

class BalanceModelDB extends Dexie {
  public balances!: Table<Balance, number>
  public constructor() {
    super('balance-model')
    this.version(1).stores({
      balances: '++id, &[address+symbol], walletId, address, balance',
    })
  }
}

const BalanceModel = new BalanceModelDB()

export default BalanceModel
