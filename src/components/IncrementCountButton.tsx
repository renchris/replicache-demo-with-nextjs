'use client'

import { useEffect, useState } from 'react'
import { incrementButton, openPokeConnection, subscribeButton } from '@app/replicacheActions'

const IncrementCountButton = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const open = async () => {
      await openPokeConnection()
    }
    const subscribe = async () => {
      await subscribeButton(setCount)
    }
    open()
    subscribe()
  }, [])
  const handleClick = async () => {
    const ret = await incrementButton()
    setCount(ret)
  }

  return (
    <div>
      <button type="button" onClick={handleClick}>Click Me</button>
      <pre>
        Clicked
        {' '}
        {count}
        {' '}
        times
      </pre>
    </div>
  )
}

export default IncrementCountButton
