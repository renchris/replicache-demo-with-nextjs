import { NextRequest, NextResponse } from 'next/server'
import type { PullRequestV1 } from 'replicache'
import processPull from '@app/pullActions'

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  const pull: PullRequestV1 = await request.json()
  console.log('Processing pull', JSON.stringify(pull))

  const t0 = Date.now()
  try {
    const { nextUrl: { searchParams } } = request
    const userID = searchParams.get('userID') ?? ''
    const body = processPull(pull, userID)
    const response = NextResponse.json(body)
    return response
  } catch (error: unknown) {
    console.error((error as Error).message)
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
  } finally {
    console.log('Processed pull in', Date.now() - t0)
  }
}
