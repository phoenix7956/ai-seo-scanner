import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { scrapePage } from '@/lib/scraper'
import { analyzePage } from '@/lib/analyzer'

// In-memory store for demo (use Supabase in production)
const scanStore = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Scrape and analyze
    const pageData = await scrapePage(url)
    const result = analyzePage(pageData)
    
    // Generate scan ID
    const scanId = uuidv4()
    
    // Store scan result (in production, save to Supabase)
    const { url: _url, ...restResult } = result
    const scanRecord = {
      id: scanId,
      url,
      ...restResult,
      isPaid: false,
      createdAt: new Date().toISOString()
    }
    scanStore.set(scanId, scanRecord)

    // Return preview (scores but not full issues with fixes)
    return NextResponse.json({
      scanId,
      url,
      overallScore: result.overallScore,
      scores: result.scores,
      criticalCount: result.criticalCount,
      // Don't send full issues in preview - user needs to pay
      preview: {
        issueCount: result.issues.length,
        topCriticalIssues: result.issues
          .filter(i => i.severity === 'critical')
          .slice(0, 3)
          .map(i => ({ title: i.title, category: i.category }))
      }
    })

  } catch (error: any) {
    console.error('Scan error:', error)
    
    // Handle specific error types
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

  if (!scanId) {
    return NextResponse.json(
      { error: 'Scan ID is required' },
      { status: 400 }
    )
  }

  // In production, fetch from Supabase
  const scan = scanStore.get(scanId)

  if (!scan) {
    return NextResponse.json(
      { error: 'Scan not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(scan)
}
