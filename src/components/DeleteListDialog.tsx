import { Portal } from '@ark-ui/react'
import { Stack } from 'styled-system/jsx'
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
& DialogProps) => (
  <Dialog.Root {...props}>
    <Dialog.Trigger asChild>
      {children}
    </Dialog.Trigger>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner height="auto">
        <Dialog.Content>
          <Stack gap="8" p="6">
            <Dialog.Title>Delete the current list?</Dialog.Title>
            <Dialog.Description>
              <Label>
                List:
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
                  width="full"
                  onClick={() => handleDeleteList()}
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

export default DeleteListDialog
