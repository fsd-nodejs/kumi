import { useLocation } from '@umijs/max'
import { useDebounceEffect } from 'ahooks'
import { Spin } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { useParams, history, useModel } from 'umi'

import { closePopupOrRedirectToHome } from '@/utils/tools/popup-redirect'

import { useDappRequestById } from '@/hooks/dapp.request'

import Header from './components/Header'
import Transaction from './components/Transaction'
import styles from './index.module.less'

const UIRequest: React.FC = () => {
  const location = useLocation()
  const { reqId } = useParams<{ reqId: string }>()
  const { index = 0, total = 0, request } = useDappRequestById(reqId) ?? {}
  const { dappRequests = [], preDappRequests = [] } = useModel(
    'popup-request-queue',
  )
  const { wallets = [] } = useModel('wallets')

  useDebounceEffect(
    () => {
      if (request) {
        return
      }
      const latestReq = dappRequests.slice(-1).pop()
      if (latestReq) {
        history.replace(`/ui-request/${latestReq.payload.id}`)
      } else {
        closePopupOrRedirectToHome(location.state as any)
      }
    },
    [request, dappRequests],
    {
      wait: 200,
    },
  )
  useEffect(() => {
    if (
      dappRequests.length > preDappRequests.length &&
      preDappRequests.length > 0
    ) {
      const latestReq = dappRequests.slice(-1).pop()
      if (latestReq) {
        history.replace(`/ui-request/${latestReq.payload.id}`)
      }
    }
  }, [preDappRequests, dappRequests])
  const onLeftClick = useCallback(() => {
    const newRequest = dappRequests[index - 1]
    if (newRequest) {
      history.replace(`/ui-request/${newRequest.payload.id}`)
    }
  }, [index, dappRequests])
  const onRightClick = useCallback(() => {
    const newRequest = dappRequests[index + 1]
    if (newRequest) {
      history.replace(`/ui-request/${newRequest.payload.id}`)
    }
  }, [index, dappRequests])

  const currentWallet = useMemo(() => {
    if (wallets && request) {
      const w = wallets.find(
        (w) => w.address === request.payload.params[0]?.address,
      )
      return w
    }
  }, [wallets, request])

  if (!request) {
    return <Spin className={styles['spin-center']} />
  }

  return (
    <div className={styles.container}>
      <Header
        index={index}
        total={total}
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        address={currentWallet?.address}
        name={currentWallet?.name}
      />
      <Transaction request={request} sender={currentWallet?.address} />
    </div>
  )
}

export default UIRequest
