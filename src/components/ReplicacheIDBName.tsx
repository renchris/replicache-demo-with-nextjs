'use client'

import { getReplicache } from '@replicache/constructor'
import { useEffect, useState } from 'react'

const ReplicacheIDBName = () => {
  const [idbName, setIdbName] = useState('')
  useEffect(() => {
    const getRep = async () => {
      const { rep } = await getReplicache()
      setIdbName(rep.idbName)
    }
    getRep()
  }, [])

  return (
    <code>
      {idbName}
    </code>
  )
}
export default ReplicacheIDBName
