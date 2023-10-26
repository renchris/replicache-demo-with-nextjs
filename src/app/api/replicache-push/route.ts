import { NextResponse } from 'next/server'
import type { MutationV1, PushRequestV1 } from 'replicache'
import db from 'db'
import { processMutation, sendPoke } from '@app/pushActions'

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  let t0: number = 0
  try {
    const push: PushRequestV1 = await request.json()
    console.log('Processing push', JSON.stringify(push))
    t0 = Date.now()

    push.mutations.forEach((mutation: MutationV1) => {
      const t1 = Date.now()
      try {
        db.transaction(() => processMutation(push.clientGroupID, mutation))
      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          const errorMessage = error.message
          db.transaction(() => processMutation(push.clientGroupID, mutation, errorMessage))
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
