'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ReadTransaction } from 'replicache'
import { useSubscribe } from 'replicache-react'
import { css } from '@styled-system/css'
import { getList } from '@replicache/mutators'
import { useReplicacheContext } from '@lib/create-replicache-context'
import { handleNewItem } from '@actions/replicache/todoActions'
import ItemInput from '@components/ItemInput'

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
