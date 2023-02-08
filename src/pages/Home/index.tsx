import { PlusOutlined } from '@ant-design/icons'
import { history } from '@umijs/max'
import { Button, Typography, Row, Col } from 'antd'

import styles from './index.less'

const { Title } = Typography

const HomePage: React.FC = () => {
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
      <div style={{ marginTop: 60, textAlign: 'center' }}>
        <Typography.Text>
          You currently do not have any accounts. Create your first account to
          get started.
        </Typography.Text>
      </div>
    </div>
  )
}

export default HomePage
