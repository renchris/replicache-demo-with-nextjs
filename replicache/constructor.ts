'use client'

import { Replicache } from 'replicache'
import TUTORIAL_LICENSE_KEY from '@replicache/license'

import type { WriteTransaction } from 'replicache'
import initSpace from './space'

export const serverURL = 'https://replicache-counter-pr-6.onrender.com'

type IReplicache = Replicache<{
  increment: (tx: WriteTransaction, delta: number) => Promise<number>
}>

const getReplicache = async (): Promise<{ rep: IReplicache, spaceID: string }> => {
  const spaceID = await initSpace(serverURL)
  const rep = new Replicache({
    name: 'user42',
    licenseKey: process.env.LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
    pushURL: `${serverURL}/api/replicache/push?spaceID=${spaceID}`,
    pullURL: `${serverURL}/api/replicache/pull?spaceID=${spaceID}`,
    mutators: {
      increment: async (tx: WriteTransaction, delta: number) => {
        const prev = (await tx.get('count') as number) ?? 0
        const next = prev + delta
        await tx.put('count', next)
        return next
      },
    },
  })
  return { rep, spaceID }
}

const getChatReplicache = (): Replicache | null => {
  const rep = typeof window !== 'undefined'
    ? new Replicache({
      name: 'chat-user-id',
      licenseKey: process.env.LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
      pushURL: '/api/replicache-push',
      pullURL: '/api/replicache-pull',
    })
    : null

  return rep
}

export {
  getReplicache,
  getChatReplicache,
}
