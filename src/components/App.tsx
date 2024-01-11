'use client'

import Layout from '@components/Layout'
import Lists from '@components/Lists'
import TodoApp from '@components/TodoApp'

import { getRowVersioningReplicache } from '@replicache/constructor'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useState } from 'react'

const rep = getRowVersioningReplicache()

const App = () => {
  const [userID, setUserID] = useState('')
  const storageListener = useCallback(() => {
    const userIDFromStorage = localStorage.getItem('userID')
    if (!userIDFromStorage) {
      const newUserID = nanoid(6)
      localStorage.setItem('userID', newUserID)
      setUserID(newUserID)
    } else {
      setUserID(userIDFromStorage)
    }
  }, [])
  useEffect(() => {
    storageListener()
    window.addEventListener('storage', storageListener, false)
    return () => {
      window.removeEventListener('storage', storageListener, false)
    }
  }, [])

  useEffect(() => {
    if (rep) {
      rep.pullURL = `/api/replicache-pull?userID=${userID}`
      rep.pushURL = `/api/replicache-push?userID=${userID}`
    }
  }, [userID])

  const handleUserIDChange = (newUserID: string) => {
    localStorage.setItem('userID', newUserID)
    storageListener()
  }

  return (
    <Layout>
      <Lists rep={rep} />
      <TodoApp
        rep={rep}
        userID={userID}
        handleUserIDChange={handleUserIDChange}
      />
    </Layout>
  )
}

export default App
