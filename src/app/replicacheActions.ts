'use client'

import Pusher from 'pusher-js'
import { getChatReplicache } from '@replicache/constructor'
import type { Replicache } from 'replicache'
import { useSubscribe } from 'replicache-react'
import type { Message } from '@replicache/types'
import type { Mutators } from '@replicache/mutators'

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

export const listen = (rep: Replicache<Mutators> | null) => {
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
