import * as Mathjs from 'mathjs'
import Numeral from 'numeral'

export function trim(str: string) {
  return str.trim()
}

export const formatBalance = ({
  balance,
  decimals,
  format,
}: {
  balance: string
  decimals: number
  format?: string
}) => {
  const formatted = Mathjs.bignumber(balance).div(
    Mathjs.bignumber(10).pow(decimals),
  )
  return Numeral(formatted.toString()).format(format ?? '0,0.0000')
}
