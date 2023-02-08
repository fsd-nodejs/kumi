import { CloseOutlined, WarningTwoTone } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import {
  Button,
  Typography,
  message,
  Row,
  Col,
  Card,
  Avatar,
  Checkbox,
  Spin,
} from 'antd'
import { useState } from 'react'

import { rpcClient } from '@/services/rpc-client'

import styles from './index.less'

const { Title, Paragraph } = Typography

const CreatePage: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false)

  const { data: account, loading } = useRequest(
    async () => {
      return rpcClient.sendRequest({
        method: 'wallet_createSeed',
        params: [{}],
      })
    },
    {
      onError: (e) => {
        message.error(e.message)
      },
    },
  )

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Title level={4} style={{ marginTop: 0 }}>
              Create an account
            </Title>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button
              title="Cancel"
              icon={<CloseOutlined />}
              onClick={() => {
                history.go(-1)
              }}
            ></Button>
          </Col>
        </Row>
        <Card>
          <Card.Meta avatar={<Avatar>U</Avatar>} title="unknown" />
          <Paragraph
            copyable={{ tooltips: ['Copy address', 'Copied!'] }}
            style={{ marginTop: 16, marginBottom: 0 }}
          >
            {account?.address}
          </Paragraph>
        </Card>
        <Row style={{ marginTop: 16 }}>
          <Paragraph>GENERATED 12-WORD MNEMONIC SEED:</Paragraph>
        </Row>
        <Card>
          <Paragraph
            copyable={{ tooltips: ['Copy address', 'Copied!'] }}
            style={{ marginBottom: 0 }}
            type="warning"
          >
            {account?.seed}
          </Paragraph>
        </Card>
        <Row style={{ marginTop: 16 }}>
          <Paragraph>
            <WarningTwoTone twoToneColor="#faad14" style={{ marginRight: 8 }} />
            Please write down your wallet&#39;s mnemonic seed and keep it in a
            safe place. The mnemonic can be used to restore your wallet. Keep it
            carefully to not lose your assets.
          </Paragraph>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Checkbox
            onChange={(e) => {
              setIsChecked(e.target.checked)
            }}
          >
            I have saved my mnemonic seed safely
          </Checkbox>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Button
            disabled={!isChecked}
            style={{ width: '100%' }}
            type="primary"
          >
            Next step
          </Button>
        </Row>
      </Spin>
    </div>
  )
}

export default CreatePage
