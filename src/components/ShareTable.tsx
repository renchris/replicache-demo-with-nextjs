import { Share } from '@replicache/types'
import { Button, ExitIcon } from './park-ui/Button'
import type { TableProps } from './park-ui/Table'
import * as Table from './park-ui/Table'

const ShareTable = ({
  guests,
  handleDeleteCollaborator,
  ...props
}: {
  guests: Share[] | [],
  handleDeleteCollaborator: (id: string) => Promise<void>,
} & TableProps) => (
  <Table.Root {...props}>
    <Table.Caption>Shared Guests</Table.Caption>
    <Table.Head>
      <Table.Row>
        <Table.Header>User ID</Table.Header>
        <Table.Header>ID</Table.Header>
        <Table.Header>List ID</Table.Header>
        <Table.Header textAlign="right" />
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {guests.map((guest) => (
        <Table.Row key={guest.id}>
          <Table.Cell fontWeight="medium">{guest.userID}</Table.Cell>
          <Table.Cell>{guest.id}</Table.Cell>
          <Table.Cell>{guest.listID}</Table.Cell>
          <Table.Cell textAlign="right">
            <Button
              variant="ghost"
              marginY="auto"
              marginLeft="auto"
              height="20px"
              width="20px"
              minWidth="20px"
              padding="2px"
              borderRadius="2px"
              onClick={() => handleDeleteCollaborator(guest.id)}
            >
              <ExitIcon />
            </Button>

          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
    <Table.Footer>
      <Table.Row>
        <Table.Cell colSpan={2}>Totals</Table.Cell>
        <Table.Cell colSpan={2} textAlign="right">
          {' '}
          {guests.length}
          {' '}
          Guests
        </Table.Cell>
      </Table.Row>
    </Table.Footer>
  </Table.Root>
)

export default ShareTable
