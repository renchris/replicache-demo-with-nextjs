'use client'

import Layout from '@components/Layout'
import Lists from '@components/Lists'
import TodoApp from '@components/TodoApp'
import { useReplicacheContext } from '@lib/create-replicache-context'

const App = ({ children } : { children: React.ReactNode }) => {
  const { rep, userID, handleUserIDChange } = useReplicacheContext()

  return (
    <Layout>
      <Lists rep={rep} />
      <TodoApp
        rep={rep}
        userID={userID}
        handleUserIDChange={handleUserIDChange}
      >
        {children}
      </TodoApp>
    </Layout>
  )
}

export default App
