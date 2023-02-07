export interface WrappedPromise<T> {
  promise: Promise<T>
  cancel: () => void
}

export function makeCancelable<T>(promise: Promise<T>): WrappedPromise<T> {
  let rejectCallback: (reason?: any) => void
  const cancelPromise = new Promise<T>((_resolve, reject) => {
    rejectCallback = reject
  })
  return {
    promise: Promise.race([cancelPromise, promise]),
    cancel() {
      rejectCallback('promise canceld')
    },
  }
}

interface CacheRecordItem {
  key: string
  data: unknown
  updateTime: number
  maxAge: number
}
const promiseCacheRecord: Record<string, CacheRecordItem> = {}
export async function cachePromise<T>(
  fn: () => Promise<T>,
  params: { key: string; maxAge?: number; forceUpdate?: boolean },
): Promise<T> {
  const { key, maxAge = 10 * 60 * 1000, forceUpdate = false } = params
  const recordItem = promiseCacheRecord[key]
  if (!forceUpdate && recordItem) {
    const expired = Math.abs(recordItem.updateTime - Date.now()) > maxAge
    if (!expired) {
      return recordItem.data as T
    }
  }
  const result = await fn()
  promiseCacheRecord[key] = {
    key,
    data: result,
    maxAge,
    updateTime: Date.now(),
  }
  return result
}

export async function retryPromise<T>(
  fn: () => Promise<T>,
  retryCount = 5,
  retryInterval = 1000,
  err?: Error,
): Promise<T> {
  if (retryCount === 0) {
    throw err ?? new Error('load failed')
  }
  try {
    const result = await fn()
    return result
  } catch (e) {
    const next = retryCount - 1
    await new Promise((resolve) => {
      setTimeout(resolve, retryInterval)
    })
    return retryPromise(fn, next, retryInterval, e as Error)
  }
}
