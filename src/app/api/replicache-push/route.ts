import { NextResponse } from 'next/server'
import type { MutationV1, PushRequestV1 } from 'replicache'
import db from 'db'
import { processMutation, sendPoke } from '@app/pushActions'

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  let t0: number = 0
  const affected = {
    listIDs: new Set<string>(),
    userIDs: new Set<string>(),
  }
  try {
    const push: PushRequestV1 = await request.json()
    console.log('Processing push', JSON.stringify(push))
    t0 = Date.now()
    // get userID from local/cookie storage or somewhere
    const userID = '0'

    push.mutations.forEach(async (mutation: MutationV1) => {
      const t1 = Date.now()
      try {
        const result = db.transaction(() => processMutation(push.clientGroupID, userID, mutation))
        result.affected.listIDs.forEach((affectedListID) => {
          affected.listIDs.add(affectedListID)
        })
        result.affected.userIDs.forEach((affectedUserID) => {
          affected.userIDs.add(affectedUserID)
        })
      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          const errorMessage = error.message
          db.transaction(() => processMutation(push.clientGroupID, userID, mutation, errorMessage))
        }
      }
      console.log('Processed mutation in', Date.now() - t1)
    })
    await sendPoke()
    const response = NextResponse.json({})
    return response
  } catch (error: unknown) {
    console.error((error as Error).message)
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
  } finally {
    console.log('Processed push in', Date.now() - t0)
  }
}
