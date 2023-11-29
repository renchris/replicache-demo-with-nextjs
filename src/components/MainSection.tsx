'use client'

import { css } from '@styled-system/css'
import type { List } from '@replicache/types'

const MainSection = (
  {
    children,
    selectedList,
  }: {
    children: React.ReactNode,
    selectedList: List | undefined },
) => (
  <div
    className={css({
      backgroundColor: 'white',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.25)',
      marginTop: '12px',
      padding: '16px 32px',
    })}
  >
    {selectedList ? (
      <div>
        This is the selected list
      </div>
    ) : (
      <div>
        No list selected
      </div>
    )}
    {children}
  </div>
)

export default MainSection
