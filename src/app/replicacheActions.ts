'use client'

import Pusher from 'pusher-js'
import { getChatReplicache, getReplicache, serverURL } from '@replicache/constructor'
import type { Dispatch, SetStateAction } from 'react'
import type { Replicache, WriteTransaction } from 'replicache'
import { useSubscribe } from 'replicache-react'
import type { Message, MessageWithID } from '@replicache/types'

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

export const listen = (rep: Replicache<{
  createMessage: (tx: WriteTransaction, {
    id, from, content, order,
  }: MessageWithID) => Promise<void>;
}> | null) => {
  if (rep) {
    console.log('👂 listening')
    Pusher.logToConsole = true
    const pusher = new Pusher('app-key', {
      cluster: '',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
    })
    const channel = pusher.subscribe('default-channel')
    channel.bind('poke-event', () => {
      console.log('🫰 got poked')
      rep.pull()
    })
  }
}
