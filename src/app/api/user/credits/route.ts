import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const visitorId = searchParams.get('visitorId')

  if (!visitorId) {
    return NextResponse.json({ error: 'visitorId required' }, { status: 400 })
  }

  try {
    const user = await getOrCreateUser(visitorId)
    return NextResponse.json({
      credits: user.credits,
      is_first_purchase: user.is_first_purchase
    })
  } catch (error: any) {
    console.error('Credits fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
