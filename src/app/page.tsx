'use server'

import { css } from '@styled-system/css'
import ReplicacheIDBName from '@components/ReplicacheIDBName'
import IncrementCountButton from '@components/IncrementCountButton'

const HomePage = () => (
  <div>
    <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
    <p>
      IDB Database Name:
      {' '}
      <ReplicacheIDBName />
    </p>
    <p>
      Increment Count:
      {' '}
    </p>
    <IncrementCountButton />
  </div>
)
export default HomePage
