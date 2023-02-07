import assert from 'assert'

import { KoaContext } from '../koa-ts'

const ExampleController = {
  async example_queryUserInfo(ctx: KoaContext<[{ username: string }]>) {
    const { username } = ctx.params[0]

    assert(username, 'username must be a string')

    const userInfo = {
      username,
      school: 'Kumi',
      age: 1,
    }
    return ctx.pushResponse(userInfo)
  },
}

export default ExampleController
