import Icon from '@polkadot/react-identicon'
import { Avatar, Card, Typography } from 'antd'
import { FC } from 'react'

const { Paragraph } = Typography

export const AccountInfo: FC<{
  name?: string
  address?: string
  actions?: React.ReactNode[]
  children?: React.ReactNode
}> = ({ name, address, actions, children }) => {
  const cName = name ?? ''
  const cAddress = address ?? ''

  return (
    <Card style={{ marginBottom: 16 }} actions={actions}>
      <Card.Meta
        avatar={
          <Avatar icon={<Icon size={32} value={cAddress || 'User'} />}></Avatar>
        }
        title={cName.length > 2 ? name : '<unknown>'}
      />
      <Paragraph
        copyable={{ tooltips: ['Copy address', 'Copied!'] }}
        style={{ marginTop: 16, marginBottom: 0 }}
      >
        {cAddress || '<unknown>'}
      </Paragraph>
      {children}
    </Card>
  )
}
