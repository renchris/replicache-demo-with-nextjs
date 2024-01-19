'use client'

import type { KeyboardEvent, Dispatch, SetStateAction } from 'react'
import { css } from '@styled-system/css'
import { Input } from './park-ui/Input'

const ItemInput = ({
  itemName,
  setItemName,
  handleSubmitItem,
}: {
  itemName: string,
  setItemName: Dispatch<SetStateAction<string>>,
  handleSubmitItem: (text: string) => Promise<void>,
}) => {
  const handleEnter = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitItem(itemName)
      setItemName('')
    }
  }
  return (
    <Input
      placeholder="What needs to be done?"
      value={itemName}
      onChange={(event) => setItemName(event.target.value)}
      onKeyDown={handleEnter}
      className={css({
        padding: '32px 64px',
        boxShadow: 'inset 0 -2px 1px #00000008',
        boxSizing: 'border-box',
        fontSize: '24px',
        fontStyle: 'italic',
        borderRadius: '0px',
        borderColor: 'transparent',
        _focus: {
          boxShadow: '0 0 0 1px #b83f45',
          borderColor: '#b83f45',
        },
      })}
    />
  )
}

export default ItemInput
