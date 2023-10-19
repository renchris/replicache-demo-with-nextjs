async function fetchJSON(serverURL: string, apiName: string, spaceID?: string) {
  const res = await fetch(`${serverURL}/api/replicache/${apiName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceID,
    }),
  })
  return res.json()
}

async function spaceExists(serverURL: string, spaceID: string) {
  const spaceExistRes = await fetchJSON(serverURL, 'spaceExists', spaceID)
  return spaceExistRes.spaceExists
}

async function createSpace(serverURL: string) {
  const createSpaceRes = await fetchJSON(serverURL, 'createSpace')
  return createSpaceRes.spaceID
}

async function initSpace(serverURL: string) {
  const { pathname } = window.location
  const paths = pathname.split('/')
  const [, spaceDir, spaceID] = paths

  if (spaceDir === 'space' && spaceID) {
    if (await spaceExists(serverURL, spaceID)) {
      return spaceID
    }
  }

  const newSpaceID = await createSpace(serverURL)
  window.history.pushState(null, '', `/space/${newSpaceID}`)
  return newSpaceID
}

export default initSpace
