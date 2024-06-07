'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Replicache } from 'replicache'
import type { Mutators } from '@replicache/mutators'
import { getRowVersioningReplicache } from '@replicache/constructor'
import listen from '@actions/replicache/listenActions'
import { nanoid } from 'nanoid'

type IReplicacheContext = {
  rep: Replicache<Mutators> | null,
  userID: string,
  handleUserIDChange: (newUserID: string) => void
}

const ReplicacheContext = createContext<IReplicacheContext | null>(null)

const rep = getRowVersioningReplicache()

const ReplicacheContextProvider = ({ children } : { children: React.ReactNode }) => {
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

  useEffect(() => {
    listen(rep)
  }, [])

  const handleUserIDChange = (newUserID: string) => {
    localStorage.setItem('userID', newUserID)
    storageListener()
  }

  const contextValue = useMemo(() => ({
    rep,
    userID,
    handleUserIDChange,
  }), [rep, userID, handleUserIDChange])

  return (
    <ReplicacheContext.Provider
      value={contextValue}
    >
      {children}
    </ReplicacheContext.Provider>
  )
}

const useReplicacheContext = () => {
  const context = useContext(ReplicacheContext)
  if (!context) {
    throw new Error('useReplicacheContext must be used within a ReplicacheContextProvider')
  }
  return context
}

export {
  ReplicacheContextProvider,
  useReplicacheContext,
}
