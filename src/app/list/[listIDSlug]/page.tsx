'use client'

import { useState } from 'react'
import { useReplicacheContext } from 'src/lib/create-replicache-context'
import { usePathname } from 'next/navigation'
import ItemInput from '@components/ItemInput'
import { handleNewItem } from '@app/todoActions'
import { useSubscribe } from 'replicache-react'
import { ReadTransaction } from 'replicache'
import { getList } from '@replicache/mutators'
import { css } from '@styled-system/css'

const ListPage = () => {
  const { rep } = useReplicacheContext()
  const [itemName, setItemName] = useState('')
  const pathname = usePathname()
  const listID = pathname.split('/').pop() || ''
  const selectedList = useSubscribe(
    rep,
    (tx: ReadTransaction) => getList(tx, listID),
    { default: undefined, dependencies: [listID] },
  )
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
    selectedList
      ? (
        <ItemInput
          itemName={itemName}
          setItemName={setItemName}
          handleSubmitItem={handleSubmitItem}
        />
      ) : (
        <div className={css({
          padding: '32px',
        })}
        >
          List Cannot be Found With Current Permissions
        </div>
      )

  )
}

export default ListPage
