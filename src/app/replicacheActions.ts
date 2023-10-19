'use client'

import getReplicache, { serverURL } from '@replicache/constructor'
import { Dispatch, SetStateAction } from 'react'

export const incrementButton = async (): Promise<number> => {
  const { rep } = await getReplicache()
  const ret = await rep.mutate.increment(1)
  return ret
}

export const subscribeButton = async (
  setCount: Dispatch<SetStateAction<number>>,
) => {
  const { rep } = await getReplicache()
  rep.subscribe(async (tx) => (await tx.get('count') as number) ?? 0, {
    onData: (count) => {
      console.log('onData', count)
      setCount(count)
    },
  })
}

export const openPokeConnection = async () => {
  const { rep, spaceID } = await getReplicache()
  const ev = new EventSource(
    `${serverURL}/api/replicache/poke?spaceID=${spaceID}`,
    {
      withCredentials: false,
    },
  )
  ev.onmessage = async (event) => {
    if (event.data === 'poke') {
      rep.pull()
    }
  }
}
