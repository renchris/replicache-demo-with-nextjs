import { Portal } from '@ark-ui/react'
import { Stack } from 'styled-system/jsx'
import { Share } from '@replicache/types'
import { useState } from 'react'
import { css } from '@styled-system/css'
import { Button } from './park-ui/Button'
import { Input } from './park-ui/Input'
import { FormLabel } from './park-ui/FormLabel'
import * as Dialog from './park-ui/Dialog'
import ShareTable from './ShareTable'

const ShareListDialog = ({
  handleAddCollaborator,
  handleDeleteCollaborator,
  guests,
  children,
  ...props
}:{
  handleAddCollaborator: (id: string) => Promise<void>,
  handleDeleteCollaborator: (id: string) => Promise<void>,
  guests: Share[] | [],
  children: React.ReactNode }
& Dialog.RootProps) => {
  const [shareUserID, setShareUserID] = useState<string>('')
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Stack
              gap="8"
              p="6"
              overflow="scroll"
              maxHeight="calc(100vh - 96px)"
            >
              <Stack gap="1">
                <Dialog.Title>Add Collaborator</Dialog.Title>
                <Dialog.Description>
                  <FormLabel color="#202020" fontWeight="medium">Guest ID</FormLabel>
                </Dialog.Description>
                <div className={css({
                  display: 'flex',
                })}
                >
                  <Input
                    id="name"
                    placeholder="Guest ID"
                    value={shareUserID}
                    onChange={(e) => setShareUserID(e.target.value)}
                  />
                  <Button
                    onClick={() => handleAddCollaborator(shareUserID)}
                    marginLeft="12px"
                  >
                    Add
                  </Button>
                </div>
              </Stack>
              <Stack gap="1">
                <Dialog.Title>Current Collaborators</Dialog.Title>
                <FormLabel color="#202020" fontWeight="medium">{guests.length > 0 ? 'Guests' : 'No Guests'}</FormLabel>
                <ShareTable
                  guests={guests}
                  handleDeleteCollaborator={handleDeleteCollaborator}
                />
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

export default ShareListDialog
