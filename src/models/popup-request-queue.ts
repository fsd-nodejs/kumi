// ui-request-queue.ts
import { usePrevious } from 'ahooks'
import { useCallback, useMemo, useState } from 'react'

import type { KoaReqMessage } from '@/extension/background/koa-ts/lib/message'

import { useSubscribePopupRequest } from '@/hooks/subscription'

export default () => {
  const [localRequests, setLocalRequests] = useState<KoaReqMessage[]>([])
  const [dappRequests] = useSubscribePopupRequest()
  const preDappRequests = usePrevious(dappRequests)
  const allRequests = useMemo(() => {
    return localRequests
      .concat(dappRequests ?? [])
      .sort((a, b) => a.payload.id - b.payload.id)
  }, [localRequests, dappRequests])

  const getRequestById = useCallback(
    (id: number | string): KoaReqMessage | undefined => {
      return allRequests.find((req) => String(req.payload.id) === String(id))
    },
    [allRequests],
  )
  const addLocalRequest = useCallback(
    (req: KoaReqMessage) => {
      setLocalRequests([...localRequests, req])
    },
    [localRequests],
  )
  const removeLocalRequest = useCallback(
    (id: number | string) => {
      const newList = localRequests.filter(
        (req) => String(req.payload.id) !== String(id),
      )
      setLocalRequests(newList)
    },
    [localRequests],
  )

  return {
    allRequests,
    dappRequests,
    preDappRequests,
    localRequests,
    getRequestById,
    addLocalRequest,
    removeLocalRequest,
  }
}
