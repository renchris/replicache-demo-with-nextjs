'use client'

import { css } from '@styled-system/css'
import type { List } from '@replicache/types'
import { Button } from './Button'
import DialogComponent from './DialogComponent'

const Header = ({ selectedList }: { selectedList: List | undefined }) => (
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
        User ID: ______
      </div>
      <div
        id="buttons"
        className={css({ display: 'flex', gap: '8px' })}
      >
        <DialogComponent>
          <Button variant="outline">
            New List
          </Button>
        </DialogComponent>

        <Button variant="outline" disabled={!selectedList}>
          Delete List
        </Button>
        <Button variant="outline" disabled={!selectedList}>
          Share
        </Button>
      </div>
    </div>
  </header>
)

export default Header
