import { NextResponse } from 'next/server'
import type { PullRequestV1 } from 'replicache'
import db from 'db'
import processPull from '@app/pullActions'

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  const pull: PullRequestV1 = await request.json()
  console.log('Processing pull', JSON.stringify(pull))
  const { clientGroupID } = pull
  const fromVersion = Number(pull.cookie) || 0
  const t0 = Date.now()
  try {
    const body = await db.transaction(() => processPull(fromVersion, clientGroupID))
    const response = NextResponse.json(body)
    return response
  } catch (error: unknown) {
    console.error((error as Error).message)
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
  } finally {
    console.log('Processed push in', Date.now() - t0)
  }
}
