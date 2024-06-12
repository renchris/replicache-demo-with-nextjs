import { NextRequest, NextResponse } from 'next/server'
import type { MutationV1, PushRequestV1 } from 'replicache'
import getDB, { type Transaction } from 'drizzle/db'
import processMutation from '@actions/replicache/pushActions'
import sendPoke from '@actions/replicache/pokeActions'

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  let t0: number = 0
  const affected = {
    listIDs: new Set<string>(),
    userIDs: new Set<string>(),
  }
  try {
    const { nextUrl: { searchParams } } = request
    const userID = searchParams.get('userID') ?? ''
    const push: PushRequestV1 = await request.json()
    const db = await getDB()
    console.log('Processing push', JSON.stringify(push))
    t0 = Date.now()

    push.mutations.reduce(async (_, mutation: MutationV1) => {
      const t1 = Date.now()
      try {
        const result = await db.transaction(
          async (tx: Transaction) => processMutation(tx, push.clientGroupID, userID, mutation),
        )
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
          await db.transaction(
            async (tx: Transaction) => processMutation(
              tx,
              push.clientGroupID,
              userID,
              mutation,
              errorMessage,
            ),
          )
        }
      }
      console.log('Processed mutation in', Date.now() - t1)
    }, Promise.resolve())
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
