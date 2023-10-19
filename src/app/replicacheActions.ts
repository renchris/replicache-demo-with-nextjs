'use client'

import getReplicache from '@replicache/constructor'
import { Dispatch, SetStateAction } from 'react'

export const incrementButton = async (): Promise<number> => {
  const rep = getReplicache()
  const ret = await rep.mutate.increment(1)
  return ret
}

export const subscribeButton = async (
  setCount: Dispatch<SetStateAction<number>>,
) => {
  const rep = getReplicache()
  rep.subscribe(async (tx) => (await tx.get('count') as number) ?? 0, {
    onData: (count) => {
      console.log('onData', count)
      setCount(count)
    },
  })
}
