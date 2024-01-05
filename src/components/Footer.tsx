'use client'

import { css } from '@styled-system/css'
import { Button } from './Button'

const FILTER_TITLES = ['All', 'Active', 'Completed']

const Footer = ({
  completedCount,
  activeCount,
  currentFilter,
  onFilter,
}: {
  completedCount: number,
  activeCount: number,
  currentFilter: string,
  onFilter: (filter: string) => void,
}) => (
  <footer
    className={css({
      backgroundColor: 'white',
      boxShadow: '0 1px 1px #0003, 0 8px 0 -3px #f6f6f6, 0 9px 1px -3px #0003, 0 16px 0 -6px #f6f6f6, 0 17px 2px -6px #0003',
      display: 'flex',
      flexDir: 'row',
      alignItems: 'center',
      padding: '10px 15px',
    })}

  >
    <span className={css({
      flex: 1,
      textAlign: 'left',
      fontSize: 'xs',
    })}
    >
      {activeCount || 'No'}
      {' '}
      {activeCount === 1 ? 'Item' : 'Items'}
      {' '}
      Left
    </span>
    <ul className={css({
      display: 'flex',
      flexDir: 'row',
      justifyContent: 'center',
      flex: 1,
      textAlign: 'center',
    })}
    >
      {
        FILTER_TITLES.map((filter) => (
          <li
            key={filter}
          >
            <Button
              className={css({
                border: filter === currentFilter ? '1px solid #b83f45' : '1px solid transparent',
                backgroundColor: 'transparent',
                color: 'black',
                margin: '4px',
                _hover: {
                  borderColor: '#b83f45',
                },
                fontWeight: 'normal',
              })}
              size="xs"
              onClick={() => onFilter(filter)}

            >
              {filter}
            </Button>
          </li>
        ))
      }
    </ul>
    <div className={css({
      flex: 1,
      textAlign: 'right',
    })}
    >
      {completedCount >= 0
    && (
      <Button
        className={css({
          fontWeight: 'normal',
          backgroundColor: 'transparent',
          color: 'black',
          _hover: {
            textDecoration: 'underline',
          },
        })}
        size="xs"
      >
        Clear Completed items
      </Button>
    )}
    </div>
  </footer>
)

export default Footer
