'use server'

import ReplicacheIDBName from '@components/ReplicacheIDBName'
import IncrementCountButton from '@components/IncrementCountButton'

const IntroductionDemo = () => (
  <div>
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
export default IntroductionDemo
