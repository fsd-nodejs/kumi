import { PageContainer } from '@ant-design/pro-components'
import { useModel } from '@umijs/max'
import { useRequest } from 'ahooks'
import { Input } from 'antd'
import { useState } from 'react'

import { trim } from '@/utils/format'

import { rpcClient } from '@/services/rpc-client'

import Guide from '@/components/Guide'

import styles from './index.less'

const HomePage: React.FC = () => {
  const { name } = useModel('global')
  const [state, setState] = useState('')

  const { run, error, data, loading } = useRequest(
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
    { manual: true },
  )
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
        <div>
          <Input
            onChange={(e) => setState(e.target.value)}
            value={state}
            placeholder="Please enter username"
            style={{ width: 240, marginRight: 16 }}
          />
          <button disabled={loading} type="button" onClick={() => run(state)}>
            {loading ? 'Loading' : 'Edit'}
          </button>
          {error && <>{error.message}</>}
          {data && (
            <div>
              username: {data.username}
              <br />
              age: {data.age}
              <br />
              school: {data.school}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default HomePage
