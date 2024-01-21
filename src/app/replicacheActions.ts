'use client'

import Pusher from 'pusher-js'
import type { Replicache } from 'replicache'
import type { Mutators } from '@replicache/mutators'

// eslint-disable-next-line import/prefer-default-export
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
    channel.bind('poke-event', async () => {
      console.log('🫰 got poked')
      try {
        await rep.pull()
      } catch (error) {
        console.log('rep.pull() failed')
      }
    })
  }
}
