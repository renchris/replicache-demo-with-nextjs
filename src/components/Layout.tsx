'use server'

import { css } from '@styled-system/css'

const Layout = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div
    className={css({
      display: 'flex',
      flexDir: 'row',
      gap: '30px',
      maxW: '1000px',
      marginX: 'auto',
    })}
    id="layout"
  >
    {children}
  </div>
)
export default Layout
