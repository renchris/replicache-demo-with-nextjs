'use client'

import { css } from '@styled-system/css'
import type { List } from '@replicache/types'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from './Button'
import NewListDialog from './NewListDialog'
import DeleteListDialog from './DeleteListDialog'

const Header = ({
  selectedList,
  userID,
  listName,
  setListName,
  handleSubmitList,
  handleDeleteList,
}: {
  selectedList: List | undefined,
  userID: string,
  listName: string,
  setListName: Dispatch<SetStateAction<string>>,
  handleSubmitList: () => Promise<void>,
  handleDeleteList: () => Promise<void>,

}) => (
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
        className={css({ whiteSpace: 'nowrap' })}
      >
        User ID:
        {' '}
        {userID}
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
        <Button variant="outline" disabled={!selectedList}>
          Share
        </Button>
      </div>
    </div>
  </header>
)

export default Header
