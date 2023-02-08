import { ApiPromise, WsProvider } from '@polkadot/api'

const BalanceService = {
  async queryByAddress(address: string) {
    const wsProvider = new WsProvider('wss://ws.calamari.seabird.systems')
    const api = await ApiPromise.create({ provider: wsProvider })

    const now = await api.query.timestamp.now()

    const { nonce, data: balance } = await api.query.system.account(address)
    console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`)

    return address
  },
}

export default BalanceService
