import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import { history } from '@umijs/max'
import { useRequest } from 'ahooks'
import {
  Button,
  Typography,
  Row,
  Col,
  Spin,
  Dropdown,
  MenuProps,
  Badge,
} from 'antd'
import * as Mathjs from 'mathjs'
import Numeral from 'numeral'

import { rpcClient } from '@/services/rpc-client'

import { AccountInfo } from '@/components/AccountInfo'

import styles from './index.less'

const { Title } = Typography

const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'Create new account',
    onClick: () => {
      history.push('/create')
    },
  },
  {
    key: '2',
    label: 'Import account from pre-existing seed',
    onClick: () => {
      history.push('/create', { model: 'import' })
    },
  },
]

const formatBalance = ({
  balance,
  decimals,
}: {
  balance: string
  decimals: number
}) => {
  const formatted = Mathjs.bignumber(balance).div(
    Mathjs.bignumber(10).pow(decimals),
  )
  return Numeral(formatted.toString()).format('0,0.0000')
}

const HomePage: React.FC = () => {
  const { data: accounts, loading } = useRequest(async () => {
    return rpcClient.sendRequest({
      method: 'wallet_queryAllAccount',
      params: [],
    })
  })

  return (
    <div className={styles.container}>
      <Row style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Title level={4} style={{ marginTop: 0 }}>
            Accounts
          </Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Button icon={<PlusOutlined />} title="Create new account"></Button>
          </Dropdown>
        </Col>
      </Row>
      <Spin spinning={loading}>
        {accounts?.length === 0 && (
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <Typography.Text>
              You currently do not have any accounts. Create your first account
              to get started.
            </Typography.Text>
          </div>
        )}

        {accounts?.length !== 0 &&
          accounts?.map((account) => (
            <Badge.Ribbon
              key={account.walletId}
              text="Calamari Parachain Staging"
              color="#ff7d01"
              style={{ fontSize: '12px', lineHeight: '18px', height: '18px' }}
            >
              <AccountInfo
                name={account.name}
                address={account.address}
                actions={[
                  <ReloadOutlined key="refresh" />,
                  <EditOutlined key="edit" />,
                  <EllipsisOutlined key="ellipsis" />,
                ]}
              >
                <Row style={{ marginTop: 8 }}>
                  <Col>Balance:</Col>
                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    {formatBalance({
                      balance: account.balance?.balance ?? '',
                      decimals: account.balance?.decimals ?? 0,
                    })}{' '}
                    {account.balance?.symbol}
                  </Col>
                </Row>
              </AccountInfo>
            </Badge.Ribbon>
          ))}
      </Spin>
    </div>
  )
}

export default HomePage
