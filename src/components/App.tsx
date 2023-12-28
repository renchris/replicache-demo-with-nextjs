'use client'

import Layout from '@components/Layout'
import Lists from '@components/Lists'
import TodoApp from '@components/TodoApp'

import { getRowVersioningReplicache } from '@replicache/constructor'

const rep = getRowVersioningReplicache()

const App = () => (
  <Layout>
    <Lists rep={rep} />
    <TodoApp rep={rep} />
  </Layout>
)

export default App
