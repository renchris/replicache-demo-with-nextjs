'use server'

import { css } from '@styled-system/css'

import Chat from '@components/Chat'
import IntroductionDemo from '@components/IntroductionDemo'

const HomePage = () => (
  <div>
    <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
    <IntroductionDemo />
    <p>
      Chat:
      {' '}
    </p>
    <Chat />
  </div>
)
export default HomePage
