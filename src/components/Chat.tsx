'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useSubscribe } from 'replicache-react'
import type { Message } from '@replicache/types'
import { getChatReplicache } from '@replicache/constructor'
import { nanoid } from 'nanoid'
import { listen } from '@app/replicacheActions'

const rep = getChatReplicache()

const Chat = () => {
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

  useEffect(() => {
    listen(rep)
  }, [])

  const [username, setUsername] = useState<string>('')
  const [content, setContent] = useState<string>('')

  const MessageList = () => messages.map(([k, v]) => (
    <div key={k}>
      <b>
        {v.from}
        :
        {' '}
      </b>
      {v.content}
    </div>
  ))

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const lastPosition = messages.length ? messages[messages.length - 1][1].order : 0
    const order = lastPosition + 1
    if (rep) {
      rep.mutate.createMessage({
        id: nanoid(),
        from: username,
        content,
        order,
      })
      setContent('')
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Your username"
        />
        {' '}
        says:
        {' '}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Your message"
        />
        {' '}
        <input type="submit" />
      </form>
      <MessageList />
    </div>
  )
}

export default Chat
