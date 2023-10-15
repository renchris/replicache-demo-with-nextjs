'use client'

import initializeReplicache from '@replicache/constructor'
import { useEffect } from 'react'

const ReplicacheIDBName = () => {
  useEffect(() => {
    initializeReplicache()
  }, [])

  return (
    <code id="idbName" />
  )
}
export default ReplicacheIDBName
