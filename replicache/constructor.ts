'use client'

import { Replicache } from 'replicache'
import TUTORIAL_LICENSE_KEY from '@replicache/license'

const getReplicache = (): Replicache => {
  const rep = new Replicache({
    name: 'user42',
    licenseKey: process.env.LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
  })
  return rep
}

export default getReplicache
