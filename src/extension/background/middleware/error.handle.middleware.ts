import type { KoaContext } from '../koa-ts'
import { koaResponseForRequest } from '../koa-ts'
import { roleOfOriginUrl } from '../utils/types-utils'

/**
 * Global error handler, all of the middleware should be ErrorHandler after
 */
const ErrorHandleMiddleware = async (
  ctx: KoaContext,
  next: () => Promise<any>,
) => {
  try {
    console.debug('%c[request begin]', 'font-weight: bold;')
    console.debug(
      `%c[request from ] %c ${ctx.req.sess.role}`,
      'font-weight: bold;',
      'color: red;font-weight: bold;',
      ctx.req.msg,
    )
    await next()
    ctx.responses.forEach((res) => {
      console.debug(
        `%c[response to  ] %c ${roleOfOriginUrl(res.to)}`,
        'font-weight: bold;',
        'color: blue;font-weight: bold;',
        res,
      )
    })
    console.debug('%c[request end  ]', 'font-weight: bold;')
  } catch (error: any) {
    ctx.req.sess.sendMsg(
      koaResponseForRequest({
        reqMsg: ctx.req.msg,
        result: null,
        error: {
          code: 500,
          message:
            error.message ||
            error.response?.error?.error_message ||
            error.response?.message ||
            'background error',
        },
      }),
    )

    console.error(`middleware error:`, error)
  }
}
export default ErrorHandleMiddleware
