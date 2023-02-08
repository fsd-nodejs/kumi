import { PlusOutlined } from '@ant-design/icons'
import { history } from '@umijs/max'
import { useRequest } from 'ahooks'
import { Button, Typography, Row, Col, Spin } from 'antd'

import { rpcClient } from '@/services/rpc-client'

import { AccountInfo } from '@/components/AccountInfo'

import styles from './index.less'

const { Title } = Typography

const HomePage: React.FC = () => {
  const { data: accounts, loading } = useRequest(async () => {
    return rpcClient.sendRequest({
      method: 'wallet_queryAllAccount',
      params: [],
    })
  })
  console.log('test', accounts)
  return (
    <div className={styles.container}>
      <Row style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Title level={4} style={{ marginTop: 0 }}>
            Accounts
          </Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Button
            icon={<PlusOutlined />}
            title="Create new account"
            onClick={() => {
              history.push('/create')
            }}
          ></Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        {!accounts && (
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <Typography.Text>
              You currently do not have any accounts. Create your first account
              to get started.
            </Typography.Text>
          </div>
        )}

        {accounts &&
          accounts.map((account) => (
            <AccountInfo
              key={account.walletId}
              name={account.name}
              address={account.address}
            />
          ))}
      </Spin>
    </div>
  )
}

export default HomePage
