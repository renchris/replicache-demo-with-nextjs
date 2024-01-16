'use client'

import { Replicache } from 'replicache'
import TUTORIAL_LICENSE_KEY from '@replicache/license'
import type { WriteTransaction } from 'replicache'
import type { MessageWithID } from './types'
import mutators from './mutators'
import type { Mutators } from './mutators'

const getChatReplicache = (): Replicache<{
  createMessage: (tx: WriteTransaction, {
    id, from, content, order,
  }: MessageWithID) => Promise<void> }> | null => {
  const rep = typeof window !== 'undefined'
    ? new Replicache({
      name: 'chat-user-id',
      licenseKey: process.env.REPLICACHE_LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
      pushURL: '/api/replicache-push',
      pullURL: '/api/replicache-pull',
      mutators: {
        async createMessage(
          tx: WriteTransaction,
          {
            id, from, content, order,
          }: MessageWithID,
        ) {
          await tx.put(`message/${id}`, {
            from,
            content,
            order,
          })
        },
      },
    })
    : null

  return rep
}

const getRowVersioningReplicache = (): Replicache<Mutators> | null => {
  const rep = typeof window !== 'undefined'
    ? new Replicache({
      name: 'unique-and-user-specific-replicache-database-name',
      licenseKey: process.env.REPLICACHE_LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
      pushURL: '/api/replicache-push',
      pullURL: '/api/replicache-pull',
      mutators,
    })
    : null

  return rep
}

export {
  getChatReplicache,
  getRowVersioningReplicache,
}
