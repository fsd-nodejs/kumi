import type { IClientMeta } from '@deficonnect/types'
import type { Table } from 'dexie'
import Dexie from 'dexie'

import type { ClientRole } from '@/extension'

export interface ConnectSession {
  origin: string
  chainId: string
  chainType: string
  accounts: string[]
  clientMeta: IClientMeta
  walletId: string
  role: ClientRole
  rpcUrl?: string
}

class ConnectSessionModelDB extends Dexie {
  public connectSessions!: Table<ConnectSession, string>
  public constructor() {
    super('connect-session-model')
    this.version(1).stores({
      connectSessions: '&[origin+walletId], origin, role, walletId, accounts',
    })
  }
}

const ConnectSessionModel = new ConnectSessionModelDB()

export default ConnectSessionModel
