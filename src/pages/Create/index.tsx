import {
  ArrowLeftOutlined,
  CloseOutlined,
  WarningTwoTone,
} from '@ant-design/icons'
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
  Form,
  Input,
  Select,
} from 'antd'
import { FC, useState } from 'react'

import { rpcClient } from '@/services/rpc-client'

import styles from './index.less'

interface FormFields {
  name: string
  password: string
  network: number
}

const { Title, Paragraph, Text } = Typography

const CreatePage: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false)

  const [current, setCurrent] = useState(1)

  const [form] = Form.useForm<FormFields>()
  const name = Form.useWatch('name', form)

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

  const AccountInfo: FC<{ name?: string }> = ({ name }) => {
    const cName = name ?? ''
    return (
      <Card>
        <Card.Meta
          avatar={
            <Avatar>
              {cName.length > 2 ? cName[0].toLocaleUpperCase() : 'U'}
            </Avatar>
          }
          title={cName.length > 2 ? name : '<unknown>'}
        />
        <Paragraph
          copyable={{ tooltips: ['Copy address', 'Copied!'] }}
          style={{ marginTop: 16, marginBottom: 0 }}
        >
          {account?.address}
        </Paragraph>
      </Card>
    )
  }

  const onFinish = (values: any) => {
    console.log('Success:', values)
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className={styles.container}>
      <Row style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Title level={4} style={{ marginTop: 0 }}>
            Create an account <Text type="warning">{current}</Text>
            <Text>/2</Text>
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
      {/* Step 1 */}
      {current === 1 && (
        <Spin spinning={loading}>
          <AccountInfo />
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
              <WarningTwoTone
                twoToneColor="#faad14"
                style={{ marginRight: 8 }}
              />
              Please write down your wallet&#39;s mnemonic seed and keep it in a
              safe place. The mnemonic can be used to restore your wallet. Keep
              it carefully to not lose your assets.
            </Paragraph>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Checkbox
              checked={isChecked}
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
              onClick={() => {
                setCurrent(2)
              }}
            >
              Next step
            </Button>
          </Row>
        </Spin>
      )}

      {/* Step 2 */}
      {current === 2 && (
        <Spin spinning={loading}>
          <AccountInfo name={name} />
          <Row style={{ marginTop: 16 }}>
            <Form
              name="basic"
              form={form}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              style={{ width: '100%' }}
              initialValues={{ network: 78 }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="network"
                label="Network"
                rules={[{ required: true }]}
              >
                <Select
                  disabled
                  placeholder="Select a option and change input text above"
                >
                  <Select.Option value={78}>
                    Calamari Parachain Staging
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="name"
                name="name"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'At least 3 characters' },
                ]}
              >
                <Input placeholder="A descriptive name for your account" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'At least 6 characters' },
                ]}
              >
                <Input.Password placeholder="A new password for this account" />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error(
                          'The two passwords that you entered do not match!',
                        ),
                      )
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Row style={{ marginTop: 16 }}>
                <Col flex="36px">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                      setCurrent(1)
                    }}
                  ></Button>
                </Col>
                <Col flex="auto">
                  <Form.Item wrapperCol={{ span: 24 }}>
                    <Button
                      htmlType="submit"
                      type="primary"
                      style={{ width: '100%' }}
                    >
                      Add the account
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            {/* <Paragraph>GENERATED 12-WORD MNEMONIC SEED:</Paragraph> */}
          </Row>
        </Spin>
      )}
    </div>
  )
}

export default CreatePage
