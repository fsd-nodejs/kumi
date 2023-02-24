import type { JobProps } from '.'
import BalanceService from '../service/balance.service'
import WalletService from '../service/wallet.service'

const BalanceRefreshJob: JobProps = {
  name: 'Balance-Refresh-Job',
  alarmInfo: {
    periodInMinutes: 1,
  },
  callback: async () => {
    const wallets = await WalletService.queryAllAccount()
    await Promise.all(
      wallets?.map((wallet) => {
        return BalanceService.refreshBalance(wallet)
      }),
    )
    console.log('Balance refresh success')
  },
}

export default BalanceRefreshJob
