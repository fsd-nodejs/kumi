import { CloseOutlined } from '@ant-design/icons'
import { history, useLocation } from '@umijs/max'
import { useRequest } from 'ahooks'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'

import { formatBalance } from '@/utils/format'

import { rpcClient } from '@/services/rpc-client'

import styles from './index.less'

const { Title } = Typography

interface StateFields {
  sender?: string
}

interface FormFields {
  sender: string
  password: string
  amount: number
  recipient: string[]
}

const formatLabel = ({ name, address }: { name: string; address: string }) => {
  return `${name.toUpperCase()}(${address.substring(0, 10)}...)`
}

const SendPage: React.FC = () => {
  const location = useLocation()

  const sender = useMemo(() => {
    const state = location.state as StateFields
    return state?.sender
  }, [location.state])

  const [submitLoading, setSubmitLoading] = useState(false)

  const { data: accounts, loading } = useRequest(async () => {
    return rpcClient.sendRequest({
      method: 'wallet_queryAllAccount',
      params: [],
    })
  })

  const senderAccount = useMemo(() => {
    return accounts?.find((account) => account.address === sender)
  }, [accounts, sender])

  const [form] = Form.useForm<FormFields>()

  const onFinish = async (values: FormFields) => {
    console.log('Success finished', values)
    try {
      setSubmitLoading(true)
      const result = await rpcClient.sendRequest({
        method: 'transaction_sendTransaction',
        params: [
          {
            sender: values.sender,
            password: values.password,
            recipient: values.recipient[0],
            amount: values.amount,
          },
        ],
      })
      if (result) {
        message.success(`Send successful!`)
        history.replace('/home')
        return
      }
    } catch (error: any) {
      setSubmitLoading(false)
      message.error(error?.message)
    }
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className={styles.container}>
      <Row style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Title level={4} style={{ marginTop: 0 }}>
            Send funds
          </Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Button
            title="Cancel"
            icon={<CloseOutlined />}
            onClick={() => {
              history.replace('/home')
            }}
          ></Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Row style={{ marginBottom: 16 }}>
          <Form
            name="basic"
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            style={{ width: '100%' }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoCorrect="off"
            autoComplete="off"
            layout="vertical"
            initialValues={{
              sender: sender,
            }}
          >
            <Form.Item
              name="sender"
              label="Sender from account"
              rules={[{ required: true }]}
            >
              <>
                <Input
                  disabled
                  placeholder={formatLabel({
                    name: senderAccount?.name ?? '',
                    address: senderAccount?.address ?? '',
                  })}
                />
                <Row style={{ marginTop: 8 }}>
                  <Col>Balance:</Col>
                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    {formatBalance({
                      balance: senderAccount?.balance?.balance ?? '0',
                      decimals: senderAccount?.balance?.decimals ?? 1,
                    })}{' '}
                    {senderAccount?.balance?.symbol}
                  </Col>
                </Row>
              </>
            </Form.Item>

            <Form.Item
              name="recipient"
              label="Send to address"
              rules={[
                { required: true, message: 'Please input recipient address!' },
                () => ({
                  validator(_, value) {
                    if (value?.length === 1) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error('Only input one recipient address at a time'),
                    )
                  },
                }),
              ]}
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder=""
                options={accounts?.map((account) => {
                  return {
                    value: account.address,
                    label: formatLabel({
                      name: account.name,
                      address: account.address,
                    }),
                  }
                })}
              />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount"
              rules={[
                { required: true, message: 'Amount is required' },
                () => ({
                  validator(_, value) {
                    const balance = formatBalance({
                      balance: senderAccount?.balance?.balance ?? '0',
                      decimals: senderAccount?.balance?.decimals ?? 1,
                      format: '0.0000',
                    })
                    if (
                      value &&
                      !isNaN(value) &&
                      Number(value) + 0.4811 <= Number(balance)
                    ) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error(
                        'The amount must be less than or equal to the balance',
                      ),
                    )
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                addonAfter="KMA"
                min="0"
                step="1"
              />
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

            <Form.Item wrapperCol={{ span: 24 }}>
              <Button
                htmlType="submit"
                type="primary"
                style={{ width: '100%' }}
                loading={submitLoading}
              >
                Sign the transaction
              </Button>
            </Form.Item>
          </Form>
        </Row>
      </Spin>
    </div>
  )
}

export default SendPage
