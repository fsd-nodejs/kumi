import { useModel } from 'umi'

export const useDappRequestById = (reqId?: number | string) => {
  const { dappRequests = [] } = useModel('popup-request-queue')
  const index = dappRequests.findIndex(
    (req) => String(req.payload.id) === String(reqId),
  )
  if (index >= 0) {
    const request = dappRequests[index]
    const method = request.payload.method
    return {
      index,
      request,
      method,
      allRequests: dappRequests,
      total: dappRequests.length,
    }
  }
}
