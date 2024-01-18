'use client'

import { useState } from 'react'
import { useReplicacheContext } from 'src/lib/create-replicache-context'
import { usePathname } from 'next/navigation'
import ItemInput from '@components/ItemInput'
import { handleNewItem } from '@app/todoActions'

const ListPage = () => {
  const { rep } = useReplicacheContext()
  const [itemName, setItemName] = useState('')
  const pathname = usePathname()
  const listID = pathname.split('/').pop() || ''
  const handleSubmitItem = async (text: string) => {
    if (text) {
      await handleNewItem(
        rep,
        listID,
        text,
      )
    }
  }
  return (
    <ItemInput
      itemName={itemName}
      setItemName={setItemName}
      handleSubmitItem={handleSubmitItem}
    />
  )
}

export default ListPage
