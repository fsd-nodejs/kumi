import { convertHexToArrayBuffer } from '@deficonnect/utils'
import * as cryptoLib from '@walletconnect/iso-crypto'

import { safeJsonParse } from '@/utils/tools/json-tools'

const encryptor = require('browser-passworder')

export async function encryptMessageByKey(
  msg: string,
  keyText: string,
): Promise<string> {
  const key = convertHexToArrayBuffer(keyText)
  const result = await cryptoLib.encrypt(safeJsonParse(msg), key)
  return JSON.stringify(result)
}

export async function decryptMessageByKey(
  msg: string,
  keyString: string,
): Promise<string> {
  const key = convertHexToArrayBuffer(keyString)
  const result = await cryptoLib.decrypt(safeJsonParse(msg), key)
  return JSON.stringify(result)
}

export async function encrypt<T>(
  password: string,
  dataObj: T,
): Promise<string> {
  return encryptor.encrypt(password, dataObj)
}

export async function decrypt<T>(password: string, text: string): Promise<T> {
  return encryptor.decrypt(password, text)
}
