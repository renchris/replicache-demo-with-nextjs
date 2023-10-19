'use client'

import getReplicache from '@replicache/constructor'

// eslint-disable-next-line import/prefer-default-export
export const incrementButton = async (): Promise<number> => {
  const rep = getReplicache()
  const ret = await rep.mutate.increment(1)
  return ret
}
