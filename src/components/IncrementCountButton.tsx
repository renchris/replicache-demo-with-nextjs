'use client'

import { useState } from 'react'
import { incrementButton } from '@app/replicacheActions'

const IncrementCountButton = () => {
  const [count, setCount] = useState(0)
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
