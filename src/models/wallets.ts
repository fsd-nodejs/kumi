import { useSubscribeWallets } from '@/hooks/subscription'

export default () => {
  const [wallets, initialed] = useSubscribeWallets()

  return {
    wallets,
    loading: !initialed,
  }
}
