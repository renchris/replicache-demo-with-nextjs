'use client'

import { css } from '@styled-system/css'
import type { List, Share } from '@replicache/types'
import type {
  Dispatch, SetStateAction, ChangeEvent, KeyboardEvent,
} from 'react'
import { useState, useEffect } from 'react'
import { Button } from './Button'
import NewListDialog from './NewListDialog'
import DeleteListDialog from './DeleteListDialog'
import ShareListDialog from './ShareListDialog'
import ItemEditable from './ItemEditable'

const Header = ({
  selectedList,
  userID,
  listName,
  setListName,
  handleSubmitList,
  handleDeleteList,
  handleSubmitCollaborator,
  handleDeleteCollaborator,
  handleUserIDChange,
  guests,
}: {
  selectedList: List | undefined,
  userID: string,
  listName: string,
  setListName: Dispatch<SetStateAction<string>>,
  handleSubmitList: () => Promise<void>,
  handleDeleteList: () => Promise<void>,
  handleSubmitCollaborator: (sharedToUserID: string) => Promise<void>,
  handleDeleteCollaborator: (shareID: string) => Promise<void>,
  handleUserIDChange: (newUserID: string) => void,
  guests: Share[] | [],

}) => {
  const [textInput, setTextInput] = useState<string>(userID)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  useEffect(() => {
    if (userID) {
      setTextInput(userID)
    }
  }, [userID])
  const handleSave = (text: string) => {
    if (text.length === 0) {
      setTextInput(userID)
    } else {
      handleUserIDChange(text)
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSave(textInput)
    }
  }
  return (
    <header id="header">
      <h1
        className={css({
          fontSize: '80px',
          fontWeight: 200,
          textAlign: 'center',
          color: '#b83f45',
          textRendering: 'optimizeLegibility',
        })}
        id="h1"
      >
        {selectedList ? selectedList.name : 'todos'}
      </h1>
      <div
        id="toolbar"
        className={css({
          display: 'flex',
          flexDir: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        })}
      >
        <div
          id="login"
          className={css({
            whiteSpace: 'nowrap',
            display: 'flex',
            gap: '4px',
          })}
        >
          <span>
            User ID:
          </span>
          <ItemEditable
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onValueRevert={() => {
              setTextInput(userID)
              setIsEditing(false)
            }}
            onValueCommit={() => {
              handleSave(textInput)
              setIsEditing(false)
            }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={textInput}
            submitMode="enter"
          />
        </div>
        <div
          id="buttons"
          className={css({ display: 'flex', gap: '8px' })}
        >
          <NewListDialog
            listName={listName}
            setListName={setListName}
            handleSubmitList={handleSubmitList}
          >
            <Button variant="outline">
              New List
            </Button>
          </NewListDialog>
          <DeleteListDialog
            selectedListName={selectedList ? selectedList.name : 'no selected list'}
            handleDeleteList={handleDeleteList}
          >
            <Button variant="outline" disabled={!selectedList}>
              Delete List
            </Button>
          </DeleteListDialog>
          <ShareListDialog
            handleAddCollaborator={handleSubmitCollaborator}
            handleDeleteCollaborator={handleDeleteCollaborator}
            guests={guests}
          >
            <Button variant="outline" disabled={!selectedList}>
              Share
            </Button>
          </ShareListDialog>
        </div>
      </div>
    </header>
  )
}

export default Header
