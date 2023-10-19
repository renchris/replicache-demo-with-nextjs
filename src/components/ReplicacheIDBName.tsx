'use client'

import getReplicache from '@replicache/constructor'
import { useEffect, useState } from 'react'

const ReplicacheIDBName = () => {
  const [idbName, setIdbName] = useState('')
  useEffect(() => {
    const rep = getReplicache()
    setIdbName(rep.idbName)
  }, [])

  return (
    <code>
      {idbName}
    </code>
  )
}
export default ReplicacheIDBName
