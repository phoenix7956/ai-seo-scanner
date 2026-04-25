'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ScoreCard from '@/components/ScoreCard'
import Link from 'next/link'

const categories = [
  {
    id: 'schema',
    name: 'Schema Markup',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    id: 'content',
    name: 'Content Quality',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'technical',
    name: 'Technical SEO',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'trust',
    name: 'Trust Signals',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
]

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let vid = localStorage.getItem('aiseo_visitor_id')
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('aiseo_visitor_id', vid)
  }
  return vid
}

export default function ReportPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const scanId = params.id as string
  const visitorId = searchParams.get('visitorId') || getVisitorId()
  const isDemo = searchParams.get('demo') === 'true'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (isDemo) {
          // Demo data
          setReport({
            url: 'demo-example.com',
            overallScore: 62,
            scores: [
              { category: 'schema', value: 14 },
              { category: 'content', value: 18 },
              { category: 'technical', value: 15 },
              { category: 'trust', value: 15 }
            ],
            issues: [
              { severity: 'critical', category: 'schema', title: 'No JSON-LD structured data found', description: 'AI search engines rely heavily on structured data.', fix: 'Add JSON-LD schema.', code: '<script type="application/ld+json">...</script>' },
              { severity: 'critical', category: 'technical', title: 'Website is not using HTTPS', description: 'HTTPS is a strong trust signal.', fix: 'Install SSL.' },
              { severity: 'high', category: 'schema', title: 'Missing Organization schema', description: 'Organization schema helps AI establish identity.', fix: 'Add Organization schema.' },
              { severity: 'high', category: 'content', title: 'No author information found', description: 'AI engines value author expertise.', fix: 'Include author bio.' },
              { severity: 'medium', category: 'content', title: 'No FAQ section detected', description: 'FAQ sections are highly valued by AI.', fix: 'Add FAQ section.' }
            ],
            criticalCount: 2,
            scannedAt: new Date().toISOString()
          })
          setLoading(false)
          return
        }

        const response = await fetch(`/api/scan?id=${scanId}&visitorId=${visitorId}`)
        const data = await response.json()
        
        if (response.ok) {
          setReport(data)
          if (data.creditsRemaining !== undefined) {
            setCredits(data.creditsRemaining)
          }
        } else if (response.status === 403) {
          // Not authorized - show locked view
          setError('PURCHASE_REQUIRED')
          setShowCheckout(true)
        } else {
          setError(data.error || 'Failed to load report')
        }
      } catch (err) {
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [scanId, visitorId, isDemo])

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId })
      })
      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading your report...</p>
        </div>
      </div>
    )
  }

  // Purchase required state
  if (showCheckout && error === 'PURCHASE_REQUIRED') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">Full Report Locked</h1>
          <p className="text-text-secondary mb-6">
            Purchase a scan pack to unlock the complete AI SEO analysis with all detailed fixes and code examples.
          </p>
          
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🎉</span>
              <span className="text-lg font-semibold text-white">First-time offer</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">$0.99</p>
            <p className="text-text-secondary mb-4">5 AI SEO scans</p>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl font-semibold transition-colors"
            >
              {checkoutLoading ? 'Loading...' : 'Buy 5 Scans - $0.99'}
            </button>
          </div>
          
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (error && error !== 'PURCHASE_REQUIRED') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Report Not Found</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score < 50) return 'from-red-500'
    if (score < 75) return 'from-yellow-500'
    return 'from-emerald-500'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-text-primary">AISEO Scanner</span>
          </Link>
          <div className="flex items-center gap-4">
            {credits !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-primary font-semibold text-sm">{credits} scan{credits !== 1 ? 's' : ''} left</span>
              </div>
            )}
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              ← New Scan
            </Link>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Summary */}
        <div className="bg-surface/50 rounded-2xl border border-gray-700/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-text-secondary mb-1">AI SEO Report for</p>
              <p className="text-xl font-semibold text-text-primary break-all">{report.url}</p>
              <p className="text-sm text-text-secondary mt-1">
                Scanned on {new Date(report.scannedAt || report.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-text-secondary mb-1">Overall AI Citation Score</p>
              <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor(report.overallScore)} bg-clip-text text-transparent`}>
                {report.overallScore}
              </div>
              <p className="text-sm text-text-secondary mt-1">out of 100</p>
            </div>
          </div>
          
          {report.criticalCount > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-center">
                <span className="font-semibold">{report.criticalCount} critical</span> issue{report.criticalCount > 1 ? 's' : ''} found. 
                Address these first for maximum AI visibility improvement.
              </p>
            </div>
          )}
        </div>

        {/* Category Scores */}
        <div className="grid gap-4 mb-8">
          {report.scores.map((score: any) => {
            const cat = categories.find(c => c.id === score.category)
            const issues = report.issues?.filter((i: any) => i.category === score.category) || []
            
            return (
              <ScoreCard
                key={score.category}
                title={cat?.name || score.category}
                score={score.value}
                icon={cat?.icon}
                issues={issues}
                isPaid={true}
              />
            )
          })}
        </div>

        {/* Action Items */}
        <div className="bg-surface/50 rounded-2xl border border-gray-700/50 p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recommended Next Steps</h2>
          
          <div className="space-y-4">
            {report.issues
              ?.filter((i: any) => i.severity === 'critical' || i.severity === 'high')
              .slice(0, 5)
              .map((issue: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-background/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    issue.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <h3 className="font-medium text-text-primary">{issue.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{issue.description}</p>
                    {issue.fix && (
                      <p className="text-sm text-emerald-400 mt-1">→ {issue.fix}</p>
                    )}
                    {issue.code && (
                      <div className="mt-2">
                        <pre className="p-2 bg-black/30 rounded text-xs text-gray-300 overflow-x-auto">
                          {issue.code}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Scan Again CTA */}
        <div className="mt-8 text-center">
          <p className="text-text-secondary mb-4">Scan another website to compare scores</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Run Another Scan
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-text-secondary">
            © 2026 AISEO Scanner. Built with AI. Powered by{' '}
            <span className="text-primary">OpenClaw</span>.
          </p>
        </div>
      </footer>
    </div>
  )
}
