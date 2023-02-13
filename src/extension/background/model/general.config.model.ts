import type { Table } from 'dexie'
import Dexie from 'dexie'

export interface GeneralConfig {
  key: string
  value: unknown
}

class GeneralConfigModelDB extends Dexie {
  public configs!: Table<GeneralConfig, string>
  public constructor() {
    super('general-config-model')
    this.version(1).stores({
      configs: '&key',
    })
  }
}

const GeneralConfigModel = new GeneralConfigModelDB()

export default GeneralConfigModel
