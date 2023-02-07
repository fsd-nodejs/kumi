import { payloadId } from '@deficonnect/utils'

import type { JobProps } from '.'
import SessionManager from '../app/session.manager'

const KeepAliveJob: JobProps = {
  name: 'keep-alive-job',
  alarmInfo: {
    periodInMinutes: 1,
  },
  callback: async () => {
    const session = SessionManager.getSessionsByRole('dapp').find((s) =>
      s.origin.startsWith('https'),
    )
    session?.sendMsg({
      from: 'extension',
      to: session.origin,
      payload: {
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'dapp_pong',
        params: [],
      },
    })
  },
}

export default KeepAliveJob
