import { Portal } from '@ark-ui/react'
import { Stack } from 'styled-system/jsx'
import {
  type Dispatch, type SetStateAction, type KeyboardEvent, useState,
} from 'react'
import { Button } from './park-ui/Button'
import { Input } from './park-ui/Input'
import { Label } from './park-ui/Label'
import type { DialogProps } from './park-ui/Dialog'
import * as Dialog from './park-ui/Dialog'

const NewListDialog = ({
  listName,
  setListName,
  handleSubmitList,
  children,
  ...props
}:{
  listName: string,
  setListName: Dispatch<SetStateAction<string>>,
  handleSubmitList: () => Promise<void>,
  children: React.ReactNode }
& DialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && listName.length > 0) {
      await handleSubmitList()
      setIsOpen(false)
    }
  }
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      {...props}
    >
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Stack gap="8" p="6">
              <Stack gap="1">
                <Dialog.Title>List</Dialog.Title>
                <Dialog.Description>
                  <Label color="#202020" fontWeight="medium" htmlFor="name">Name</Label>
                </Dialog.Description>
                <Input
                  id="name"
                  placeholder="List Name"
                  value={listName}
                  onChange={(event) => setListName(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </Stack>
              <Stack gap="3" direction="row" width="full">
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" width="full">
                    Cancel
                  </Button>
                </Dialog.CloseTrigger>
                <Dialog.CloseTrigger asChild>
                  <Button
                    width="full"
                    onClick={() => handleSubmitList()}
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

export default NewListDialog
