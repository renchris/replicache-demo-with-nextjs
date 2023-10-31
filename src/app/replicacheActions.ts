'use client'

import type { Dispatch, SetStateAction } from 'react'
import { getChatReplicache, getReplicache, serverURL } from '@replicache/constructor'
import { Dispatch, SetStateAction } from 'react'
import { useSubscribe } from 'replicache-react'
import type { Message } from '@replicache/types'

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

export const subscribeToMessages = () => {
  const rep = getChatReplicache()
  const messages = useSubscribe(
    rep,
    async (tx) => {
      const list = (await tx
        .scan({ prefix: 'message/' })
        .entries()
        .toArray()) as [string, Message][]
      list.sort(([, { order: a }], [, { order: b }]) => a - b)
      return list
    },
    [],
  )
  return messages
}
