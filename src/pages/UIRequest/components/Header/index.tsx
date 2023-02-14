import { Button } from 'antd'
import { useMemo } from 'react'

import { ReactComponent as ArrowLeftIcon } from '@/assets/icon-arrow-left-light.svg'
import { ReactComponent as ArrowRightIcon } from '@/assets/icon-arrow-right-light.svg'

import styles from './index.module.less'

interface HeaderProp {
  index: number
  total: number
  address?: string
  name?: string
  onLeftClick: () => void
  onRightClick: () => void
}

export function shortHash(hash: string, prefix = 5, suffix = -5) {
  if (prefix - suffix >= hash.length) {
    return hash
  }
  return `${hash.slice(0, prefix)}...${hash.slice(suffix)}`
}

export function formatWalletAddressToShort(address: string) {
  return shortHash(address, 8, -4)
}

const HeaderQueue: React.FC<HeaderProp> = ({
  index,
  total,
  onLeftClick,
  onRightClick,
}) => {
  if (total <= 1) {
    return null
  }
  const disableLeft = index === 0
  const disableRight = index === total - 1
  return (
    <div className={styles.queue}>
      <Button
        type="text"
        className={`${styles.left} ${disableLeft ? styles.disable : ''}`}
        icon={<ArrowLeftIcon />}
        disabled={disableLeft}
        onClick={onLeftClick}
      />
      <div className={styles.center}>
        {index + 1} of {total} Confirmation
      </div>
      <Button
        type="text"
        className={`${styles.right} ${disableRight ? styles.disable : ''}`}
        icon={<ArrowRightIcon />}
        disabled={disableRight}
        onClick={onRightClick}
      />
    </div>
  )
}

const Header: React.FC<HeaderProp> = (props) => {
  const { shortAddress } = useMemo(() => {
    return {
      shortAddress: formatWalletAddressToShort(props.address ?? ''),
    }
  }, [props.address])

  return (
    <div className={styles.container}>
      {props.name && props.name && (
        <div className={styles.wallet}>
          <div className={styles.name}>{props.name}</div>
          <div className={styles.address}>({shortAddress})</div>
        </div>
      )}
      <HeaderQueue {...props} />
    </div>
  )
}

export default Header
