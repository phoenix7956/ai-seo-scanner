import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { scrapePage } from '@/lib/scraper'
import { analyzePage } from '@/lib/analyzer'
import { 
  getOrCreateUser, 
  hasCredits, 
  consumeCredit, 
  saveScan,
  getScan 
} from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, visitorId } = body

    if (!url || !visitorId) {
      return NextResponse.json(
        { error: 'URL and visitorId are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check credits
    const user = await getOrCreateUser(visitorId)
    const creditsRemaining = user.credits

    if (creditsRemaining <= 0) {
      return NextResponse.json({
        error: 'No credits remaining',
        code: 'NO_CREDITS',
        // Show the preview regardless so they see the value, but flag it
        previewOnly: true
      }, { status: 402 })
    }

    // Scrape and analyze
    const pageData = await scrapePage(url)
    const result = analyzePage(pageData)

    // Consume credit
    await consumeCredit(visitorId)

    // Save scan (not paid, no issues exposed)
    const scan = await saveScan({
      visitorId,
      url,
      overallScore: result.overallScore,
      scoreSchema: result.scores[0].value,
      scoreContent: result.scores[1].value,
      scoreTechnical: result.scores[2].value,
      scoreTrust: result.scores[3].value,
      criticalCount: result.criticalCount,
      issues: result.issues,
      isPaid: false
    })

    const newCredits = creditsRemaining - 1

    return NextResponse.json({
      scanId: scan.id,
      url,
      overallScore: result.overallScore,
      scores: result.scores,
      criticalCount: result.criticalCount,
      creditsRemaining: newCredits,
      // Limited preview - just counts, not full issues
      preview: {
        issueCount: result.issues.length,
        topCriticalIssues: result.issues
          .filter((i: any) => i.severity === 'critical')
          .slice(0, 3)
          .map((i: any) => ({ title: i.title, category: i.category })),
        canUnlock: true,
        unlockPrice: user.is_first_purchase ? 0.99 : 9,
        firstPurchaseBonus: user.is_first_purchase,
        creditsOffer: 5
      }
    })

  } catch (error: any) {
    console.error('Scan error:', error)
    
    if (error.message.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Could not reach this website. Please check the URL and try again.' },
        { status: 422 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred while scanning. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scanId = searchParams.get('id')
  const visitorId = searchParams.get('visitorId')

  if (!scanId) {
    return NextResponse.json(
      { error: 'Scan ID is required' },
      { status: 400 }
    )
  }

  const scan = await getScan(scanId)

  if (!scan) {
    return NextResponse.json(
      { error: 'Scan not found' },
      { status: 404 }
    )
  }

  // If scan is paid, return full report
  if (scan.is_paid) {
    return NextResponse.json({
      ...scan,
      // Convert snake_case to camelCase for frontend
      overallScore: scan.overall_score,
      scoreSchema: scan.score_schema,
      scoreContent: scan.score_content,
      scoreTechnical: scan.score_technical,
      scoreTrust: scan.score_trust,
      criticalCount: scan.critical_count,
      creditsUsed: scan.credits_used,
      createdAt: scan.created_at
    })
  }

  // If visitorId matches, they can see it (they used a credit)
  if (visitorId && scan.visitor_id === visitorId) {
    return NextResponse.json({
      scanId: scan.id,
      url: scan.url,
      overallScore: scan.overall_score,
      scores: [
        { category: 'schema', value: scan.score_schema },
        { category: 'content', value: scan.score_content },
        { category: 'technical', value: scan.score_technical },
        { category: 'trust', value: scan.score_trust }
      ],
      criticalCount: scan.critical_count,
      creditsRemaining: 0,
      preview: {
        issueCount: scan.issues?.length || 0,
        canUnlock: true,
        firstPurchaseBonus: true,
        creditsOffer: 5
      }
    })
  }

  // Not authorized or scan is free preview
  return NextResponse.json(
    { error: 'Purchase required to view full report' },
    { status: 403 }
  )
}
