'use server'

import { css } from '@styled-system/css'

import Chat from '@components/Chat'

const HomePage = () => (
  <div>
    <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
    <p>
      Chat:
      {' '}
    </p>
    <Chat />
  </div>
)
export default HomePage
