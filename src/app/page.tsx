'use server'

import { css } from '@styled-system/css'
import ReplicacheIDBName from '@components/ReplicacheIDBName'

const HomePage = () => (
  <div>
    <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
    <p>
      IDB Database Name:
      {' '}
      <ReplicacheIDBName />
    </p>
  </div>
)
export default HomePage
