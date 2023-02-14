import { Navigate, Outlet, useModel, useLocation } from '@umijs/max'

export default () => {
  const { dappRequests = [] } = useModel('popup-request-queue')
  const location = useLocation()

  const latestReq = dappRequests?.slice(-1).pop()
  let toPath = undefined
  if (latestReq) {
    toPath = `/ui-request/${latestReq.payload.id}`
  }

  const localPath = location.pathname ?? ''
  const isCurrentInUIRequest = localPath.startsWith('/ui-request')
  if (toPath && !isCurrentInUIRequest) {
    return <Navigate to={{ pathname: toPath }} state={{ referrer: location }} />
  }
  return <Outlet />
}
