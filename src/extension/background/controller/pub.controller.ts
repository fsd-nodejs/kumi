import { SignerResult } from '@polkadot/api/types'
import { InjectedAccount, MetadataDef } from '@polkadot/extension-inject/types'
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types'
import assert from 'assert'

import { KoaContext } from '../koa-ts'
import KeyringService from '../service/keyring.service'
import PolkadotService from '../service/polkadot.service'
import PopupRequestService from '../service/popup.request.service'
import WalletService from '../service/wallet.service'

const PubController = {
  async 'pub(accounts.list)'(ctx: KoaContext<[{ anyType?: boolean }]>) {
    const accounts = await WalletService.queryAllAccount()

    const result: InjectedAccount[] = accounts.map((account) => {
      return {
        address: account.address,
        name: account.name,
        genesisHash:
          '0x2ae061f08422b6503b8aa5f401242a209999669c3b8945f814dc096fb1a977bd',
        type: 'sr25519',
      }
    })

    return ctx.pushResponse(result)
  },
  async 'pub(metadata.list)'(ctx: KoaContext) {
    return ctx.pushResponse([
      {
        genesisHash:
          '0x2ae061f08422b6503b8aa5f401242a209999669c3b8945f814dc096fb1a977bd',
        specVersion: 4010,
      },
    ])
  },
  async 'pub(metadata.provide)'(ctx: KoaContext<[MetadataDef]>) {
    console.log('test', ctx.params[0])
    return ctx.pushResponse(true)
  },
  async 'pub(rpc.listProviders)'(ctx: KoaContext) {
    return ctx.pushResponse({})
  },
  async 'pub(extrinsic.sign)'(
    ctx: KoaContext<[SignerPayloadJSON, { password: string; sender: string }]>,
  ) {
    const payload = ctx.params[0]
    const { password } = ctx.params[1]

    const account = await WalletService.getWalletByAddress(payload.address)
    assert(account, 'Account not found')

    const seed = await KeyringService.getMnemonic(password, account.keyringId)
    assert(seed, 'Password not correct!')

    const signed = await PolkadotService.signPayload(payload, seed)

    const result: SignerResult = {
      id: ctx.id,
      signature: signed.signature,
    }

    await PopupRequestService.tryAddResponseToDapp(ctx, { result })

    return ctx.pushResponse(result)
  },
  async 'pub(bytes.sign)'(ctx: KoaContext<[SignerPayloadRaw]>) {
    console.log('test', ctx.params[0])
    const result: SignerResult = {
      id: 0,
      signature: '0x23',
    }
    return ctx.pushResponse(result)
  },
  async 'pub(authorize.tab)'(ctx: KoaContext<[{ origin: string }]>) {
    console.log('test', ctx.params[0])
    return ctx.pushResponse({
      authorizedAccounts: [],
      result: false,
    })
  },
}

export default PubController
