import { css } from '@styled-system/css'
import { Button } from './Button'
import type { EditableProps } from './Editable'
import * as Editable from './Editable'

const ItemEditable = ({
  isEditing,
  ...props
} : {
  isEditing: boolean,
} & EditableProps) => (
  <Editable.Root
    activationMode="dblclick"
    autoResize
    {...props}
  >
    {() => (
      <div className={css({
        display: 'flex',
        flexDir: 'row',
      })}
      >
        <Editable.Area width="100%">
          <Editable.Input position="absolute" display="inline-flex" />
          <Editable.Preview />
        </Editable.Area>
        <Editable.Control className={css({
          marginLeft: 'auto',
        })}
        >
          {isEditing ? (
            <>
              <Editable.SubmitTrigger asChild>
                <Button variant="link">Save</Button>
              </Editable.SubmitTrigger>
              <Editable.CancelTrigger asChild>
                <Button variant="link">Cancel</Button>
              </Editable.CancelTrigger>
            </>
          ) : (
            <Editable.EditTrigger asChild>
              <Button variant="link">Edit</Button>
            </Editable.EditTrigger>
          )}
        </Editable.Control>
      </div>
    )}
  </Editable.Root>
)

export default ItemEditable
