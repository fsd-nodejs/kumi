import type { Table } from 'dexie'
import { Dexie } from 'dexie'

export interface Keyring {
  id?: number
  buffer: Buffer
}

class KeyringModelDB extends Dexie {
  public keyrings!: Table<Keyring, number>
  public constructor() {
    super('keyring-model')
    this.version(1).stores({
      keyrings: '++id',
    })
  }
}

class KeyringModel {
  static db = new KeyringModelDB()

  public static get keyrings() {
    return KeyringModel.db.keyrings
  }
  public static async reset() {
    await Dexie.delete('keyring-model')
    KeyringModel.db = new KeyringModelDB()
  }
}

export default KeyringModel
