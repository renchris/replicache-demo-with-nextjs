'use client'

import { css } from '@styled-system/css'
import type { List, Share } from '@replicache/types'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from './Button'
import NewListDialog from './NewListDialog'
import DeleteListDialog from './DeleteListDialog'
import ShareListDialog from './ShareListDialog'

const Header = ({
  selectedList,
  userID,
  listName,
  setListName,
  handleSubmitList,
  handleDeleteList,
  handleSubmitCollaborator,
  handleDeleteCollaborator,
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
  guests: Share[] | [],

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

export default Header
