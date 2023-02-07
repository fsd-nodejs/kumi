import type { Table } from 'dexie'
import Dexie from 'dexie'

import type { KoaReqMessage } from '../koa-ts'

interface PopupRequest {
  id: number
  message: KoaReqMessage
  createTime: number
}

class PopupRequestModelDB extends Dexie {
  popupRequests!: Table<PopupRequest, number>
  public constructor() {
    super('popup-request-model')
    this.version(1).stores({
      popupRequests: '&id, createTime',
    })
  }
}
const PopupRequestModel = new PopupRequestModelDB()
export default PopupRequestModel
