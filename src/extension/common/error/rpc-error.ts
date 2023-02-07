/**
 * see more detail for error code:
 * eip-1474: https://eips.ethereum.org/EIPS/eip-1474#error-codes
 * eip-1193: https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class ProviderRpcError extends Error {
  code: number
  message: string
  constructor(code: number, message: string) {
    super()
    this.code = code
    this.message = message
  }

  toString() {
    return `${this.message} (${this.code})`
  }
}
