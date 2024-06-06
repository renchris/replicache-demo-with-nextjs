'use server'

import Pusher from 'pusher'

const sendPoke = async () => {
  const pusher = new Pusher({
    appId: 'app-id',
    key: 'app-key',
    secret: 'app-secret',
    useTLS: false,
    cluster: '',
    host: '127.0.0.1',
    port: '6001',
  })
  pusher.trigger('default-channel', 'poke-event', {})
  const t0 = Date.now()
  console.log('👉 Sent poke in', Date.now() - t0)
}

export default sendPoke
