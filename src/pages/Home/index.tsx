import { PageContainer } from '@ant-design/pro-components'
import { useModel } from '@umijs/max'
import { useRequest } from 'ahooks'
import { Button, Form, Input, Typography, message } from 'antd'

import { trim } from '@/utils/format'

import { rpcClient } from '@/services/rpc-client'

import Guide from '@/components/Guide'

import styles from './index.less'

interface FormFields {
  username: string
}

const HomePage: React.FC = () => {
  const { name } = useModel('global')

  const [form] = Form.useForm<FormFields>()

  const { run, data } = useRequest(
    async (username: string) => {
      return rpcClient.sendRequest({
        method: 'example_queryUserInfo',
        params: [
          {
            username,
          },
        ],
      })
    },
    {
      manual: true,
      onError: (e) => {
        message.error(e.message)
      },
    },
  )

  const { run: runCreateSeed, data: accountData } = useRequest(
    async () => {
      return rpcClient.sendRequest({
        method: 'wallet_createSeed',
      })
    },
    {
      manual: true,
      onError: (e) => {
        message.error(e.message)
      },
    },
  )

  const onFinished = (values: FormFields) => {
    const { username } = values
    run(username)
  }

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
        <div>
          <Form form={form} onFinish={onFinished} style={{ maxWidth: 600 }}>
            <Form.Item label="Your name" name="username">
              <Input placeholder="input placeholders" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={runCreateSeed}>Create new account</Button>
            </Form.Item>
          </Form>
          <Typography>
            <Typography.Paragraph>
              Username: {data?.username}
            </Typography.Paragraph>
            <Typography.Paragraph>Age: {data?.age}</Typography.Paragraph>
            <Typography.Paragraph>School: {data?.school}</Typography.Paragraph>
            <Typography.Paragraph>
              Seed: {accountData?.seed}
            </Typography.Paragraph>
            {/* <Typography.Paragraph>
              Address: {accountData?.address}
            </Typography.Paragraph> */}
          </Typography>
        </div>
      </div>
    </PageContainer>
  )
}

export default HomePage
