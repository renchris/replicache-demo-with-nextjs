import { Portal } from '@ark-ui/react'
import { Stack } from 'styled-system/jsx'
import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from './Button'
import type { DialogProps } from './Dialog'
import * as Dialog from './Dialog'
import { Label } from './Label'

const DeleteListDialog = ({
  handleDeleteList,
  selectedListName,
  children,
  ...props
}:{
  handleDeleteList: () => Promise<void>,
  selectedListName: string,
  children: React.ReactNode }
& DialogProps) => {
  const handleKeyDown = async (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      await handleDeleteList()
    }
  }
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog.Root {...props} initialFocusEl={() => confirmButtonRef.current}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner top="50dvh" height="0px">
          <Dialog.Content>
            <Stack gap="8" p="6">
              <Dialog.Title>Delete the current list?</Dialog.Title>
              <Dialog.Description>
                <Label>
                  {selectedListName}
                </Label>
              </Dialog.Description>
              <Stack gap="3" direction="row" width="full">
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" width="full">
                    Cancel
                  </Button>
                </Dialog.CloseTrigger>
                <Dialog.CloseTrigger asChild>
                  <Button
                    ref={confirmButtonRef}
                    width="full"
                    onClick={() => handleDeleteList()}
                    onKeyDown={handleKeyDown}
                  >
                    Confirm
                  </Button>
                </Dialog.CloseTrigger>
              </Stack>
            </Stack>
            <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
              <Button aria-label="Close Dialog" variant="ghost" size="sm">
                close
              </Button>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DeleteListDialog
