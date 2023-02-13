import type { Table } from 'dexie'
import Dexie from 'dexie'

export type WalletType = 'mnemonic' | 'privateKey' | 'hardware' | 'mobile'

export interface Wallet {
  id?: number
  walletId: string
  name: string
  icon?: string

  /** for multi wallet */
  keyringId?: number // reference to the KeyringModel id
  walletType: WalletType
  address: string
  network: number
  createTime: number
  accountIndex?: string
}

class WalletModelDB extends Dexie {
  public wallets!: Table<Wallet, number>
  public constructor() {
    super('wallet-model')
    this.version(1).stores({
      wallets:
        '++id, &walletId, name, keyringId, walletType, address, network, createTime',
    })
  }
}

const WalletModel = new WalletModelDB()

export default WalletModel
