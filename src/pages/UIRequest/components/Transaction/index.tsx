import { ProDescriptions } from '@ant-design/pro-components'
import { IJsonRpcRequest } from '@deficonnect/types'
import { formatNumber, hexToNumber } from '@polkadot/util'
import { Button, Col, Form, Input, message, Row } from 'antd'
import { useState } from 'react'

import { rpcClient } from '@/services/rpc-client'

import type { KoaReqMessage } from '@/extension/background/koa-ts'
import { IRouters } from '@/extension/background/router'

import styles from './index.module.less'

interface FormFields {
  password: string
}

export const rejectDappRequest = async (params: {
  originReq: KoaReqMessage
}) => {
  return rpcClient.sendRequest({
    method: 'dc_rejectDappRequest',
    params: [params],
  })
}

export const approveDappRequest = (params: {
  originRpc: IJsonRpcRequest
  params?: Record<string, any>
}) => {
  return rpcClient.sendRequest({
    id: params.originRpc.id,
    method: params.originRpc.method as IRouters,
    params: [...params.originRpc.params, params.params],
  })
}

const Transaction: React.FC<{ request: KoaReqMessage; sender?: string }> = ({
  request,
  sender,
}) => {
  const [btnLoading, setBtnLoading] = useState<boolean>(false)
  const [form] = Form.useForm<FormFields>()

  const handleCancel = async () => {
    await rejectDappRequest({ originReq: request })
  }

  const onConfirm = async (values: FormFields) => {
    setBtnLoading(true)
    const { password } = values
    try {
      if (!request) {
        throw new Error('request can not be null')
      }
      const txId = await approveDappRequest({
        originRpc: request.payload,
        params: {
          password: password,
          sender: sender,
        },
      })
      console.log('test txId', txId)
    } catch (error: any) {
      if (error?.message) {
        message.error(error?.message)
      }
    } finally {
      setBtnLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <ProDescriptions>
        <ProDescriptions.Item span={2} valueType="text" label="from">
          {request.from}
        </ProDescriptions.Item>
        <ProDescriptions.Item
          span={2}
          valueType="text"
          contentStyle={{
            maxWidth: '70%',
          }}
          ellipsis
          label="genesis"
        >
          {request.payload.params?.[0]?.genesisHash}
        </ProDescriptions.Item>
        <ProDescriptions.Item span={2} valueType="text" label="version">
          {hexToNumber(request.payload.params?.[0]?.specVersion)}
        </ProDescriptions.Item>
        <ProDescriptions.Item span={2} valueType="text" label="nonce">
          {hexToNumber(request.payload.params?.[0]?.nonce)}
        </ProDescriptions.Item>
        <ProDescriptions.Item
          span={2}
          valueType="text"
          contentStyle={{
            maxWidth: '60%',
          }}
          ellipsis
          label="method data"
        >
          {request.payload.params?.[0]?.method}
        </ProDescriptions.Item>
        <ProDescriptions.Item
          span={2}
          valueType="text"
          contentStyle={{
            maxWidth: '60%',
          }}
          ellipsis
          label="lifetime"
        >
          mortal, valid from{' '}
          {formatNumber(hexToNumber(request.payload.params?.[0]?.blockNumber))}
        </ProDescriptions.Item>
      </ProDescriptions>

      <Form
        form={form}
        name="basic"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        style={{ width: '100%' }}
        onFinish={onConfirm}
        autoCorrect="off"
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="PASSWORD FOR THIS ACCOUNT"
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'At least 6 characters' },
          ]}
        >
          <Input.Password placeholder="A new password for this account" />
        </Form.Item>
        <Row>
          <Col>
            <Button type="link" onClick={handleCancel} danger>
              Cancel
            </Button>
          </Col>
          <Col flex="auto">
            <Form.Item>
              <Button
                htmlType="submit"
                loading={btnLoading}
                type="primary"
                style={{ width: '100%' }}
              >
                Confirm
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default Transaction
