import { NextResponse } from 'next/server'

// eslint-disable-next-line import/prefer-default-export
export async function POST() {
  try {
    const response = NextResponse.json({
      // We will discuss these two fields in later steps.
      lastMutationIDChanges: {},
      cookie: 42,
      patch: [
        { op: 'clear' },
        {
          op: 'put',
          key: 'message/qpdgkvpb9ao',
          value: {
            from: 'Jane',
            content: "Hey, what's for lunch?",
            order: 1,
          },
        },
        {
          op: 'put',
          key: 'message/5ahljadc408',
          value: {
            from: 'Fred',
            content: 'tacos?',
            order: 2,
          },
        },
      ],
    })
    return response
  } catch (error: unknown) {
    console.error((error as Error).message)
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
  }
}
