'use client'

import { Replicache } from 'replicache'
import TUTORIAL_LICENSE_KEY from '@replicache/license'

import type { WriteTransaction } from 'replicache'

const getReplicache = (): Replicache<{
  increment: (tx: WriteTransaction, delta: number) => Promise<number>;
}> => {
  const rep = new Replicache({
    name: 'user42',
    licenseKey: process.env.LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
    mutators: {
      increment: async (tx: WriteTransaction, delta: number) => {
        const prev = (await tx.get('count') as number) ?? 0
        const next = prev + delta
        await tx.put('count', next)
        return next
      },
    },
  })
  return rep
}

export default getReplicache
