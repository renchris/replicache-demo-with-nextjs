'use client'

import { Replicache } from 'replicache'
import TUTORIAL_LICENSE_KEY from '@replicache/license'

const initializeReplicache = () => {
  const rep = new Replicache({
    name: 'user42',
    licenseKey: process.env.LICENSE_KEY ?? TUTORIAL_LICENSE_KEY,
  })

  const elm = document.querySelector('#idbName') as HTMLDivElement | null
  if (elm) {
    elm.textContent = rep.idbName
  }
}

export default initializeReplicache
