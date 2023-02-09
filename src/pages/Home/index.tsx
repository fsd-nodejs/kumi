import Icon, {
  PlusOutlined,
  ReloadOutlined,
  DeleteTwoTone,
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
  Popconfirm,
  message,
} from 'antd'

import { formatBalance } from '@/utils/format'

import { rpcClient } from '@/services/rpc-client'

import { ReactComponent as SendIcon } from '@/assets/send.svg'

import { AccountInfo } from '@/components/AccountInfo'

import styles from './index.less'

const { Title } = Typography

const headerMenuItems: MenuProps['items'] = [
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

const HomePage: React.FC = () => {
  const {
    data: accounts,
    loading,
    run,
  } = useRequest(
    async () => {
      return rpcClient.sendRequest({
        method: 'wallet_queryAllAccount',
        params: [],
      })
    },
    {
      pollingInterval: 30000,
      pollingErrorRetryCount: 3,
    },
  )

  return (
    <div className={styles.container}>
      <Row style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Title level={4} style={{ marginTop: 0 }}>
            Accounts
          </Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Dropdown
            menu={{ items: headerMenuItems }}
            placement="bottomRight"
            arrow
          >
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
                  <ReloadOutlined
                    key="refresh"
                    onClick={async () => {
                      try {
                        const result = await rpcClient.sendRequest({
                          method: 'balance_refreshBalance',
                          params: [{ address: account.address }],
                        })
                        if (result) {
                          run()
                          message.success('Balance refreshed')
                        }
                      } catch (error: any) {
                        message.error(error.message)
                      }
                    }}
                  />,
                  <Icon
                    key="send"
                    component={SendIcon}
                    onClick={() => {
                      console.log('test click')
                      history.push(`/send`, {
                        sender: account.address,
                      })
                    }}
                  />,

                  <Popconfirm
                    key="delete"
                    title="Forget account"
                    description="You are about to remove the account?"
                    okText="Yes"
                    cancelText="Cancel"
                    placement="topRight"
                    onConfirm={async () => {
                      try {
                        const result = await rpcClient.sendRequest({
                          method: 'wallet_deleteAccount',
                          params: [{ address: account.address }],
                        })
                        if (result) {
                          run()
                          message.success('Forget Account Success')
                        }
                      } catch (error: any) {
                        message.error(error.message)
                      }
                    }}
                  >
                    <DeleteTwoTone twoToneColor="red" />
                  </Popconfirm>,
                ]}
              >
                <Row style={{ marginTop: 8 }}>
                  <Col>Balance:</Col>
                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    {formatBalance({
                      balance: account.balance?.balance ?? '0',
                      decimals: account.balance?.decimals ?? 1,
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
