'use client'

import { useState, useEffect } from 'react'
import URLInput from '@/components/URLInput'
import ScoreCard from '@/components/ScoreCard'
import FAQ from '@/components/FAQ'
import Link from 'next/link'

const categories = [
  {
    id: 'schema',
    name: 'Schema Markup',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    description: 'JSON-LD, Article schema, FAQ schema, Organization schema'
  },
  {
    id: 'content',
    name: 'Content Quality',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Heading hierarchy, FAQ sections, author attribution'
  },
  {
    id: 'technical',
    name: 'Technical SEO',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Page speed, mobile-first, HTTPS, clean URLs'
  },
  {
    id: 'trust',
    name: 'Trust Signals',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    description: 'About page, contact info, E-A-T factors, author credibility'
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

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [visitorId, setVisitorId] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Init visitor ID and check for success redirect
  useEffect(() => {
    const vid = getVisitorId()
    setVisitorId(vid)
    
    // Check for checkout success redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setShowSuccess(true)
      // Refresh credits
      fetchCredits(vid)
      // Clean URL
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const fetchCredits = async (vid: string) => {
    try {
      const res = await fetch(`/api/user/credits?visitorId=${vid}`)
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      }
    } catch {}
  }

  const handleScan = async (url: string) => {
    if (!visitorId) return
    setIsScanning(true)
    setShowPreview(false)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, visitorId })
      })
      
      const data = await response.json()
      
      if (response.status === 402) {
        // No credits - show purchase modal
        setCredits(0)
        setShowCheckout(true)
        return
      }
      
      if (data.scanId) {
        setPreviewData(data)
        setShowPreview(true)
        setCredits(data.creditsRemaining)
      }
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleCheckout = async () => {
    if (!visitorId) return
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
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleGetReport = () => {
    if (!previewData?.scanId) return
    window.location.href = `/report/${previewData.scanId}?visitorId=${visitorId}`
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-text-primary">AISEO Scanner</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            {credits !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-primary font-semibold">{credits} scan{credits !== 1 ? 's' : ''} left</span>
              </div>
            )}
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Features
            </button>
          </nav>
        </div>
      </header>

      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Payment successful! You now have 5 additional scans.</span>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-emerald-400/60 hover:text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            AI Search is the new Google
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Is your website ready<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              for AI search?
            </span>
          </h1>
          
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            If ChatGPT can't find you, neither can your customers. 
            Run a full AI SEO audit and get the exact fixes to start getting cited by ChatGPT, Claude, and Perplexity.
          </p>
          
          <URLInput onSubmit={handleScan} isLoading={isScanning} />
          
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              60-second analysis
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {credits === null ? '1 free scan' : `${credits} free scan${credits !== 1 ? 's' : ''} left`}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Actionable fixes
            </span>
          </div>
        </div>
      </section>

      {/* Scan Preview */}
      {showPreview && previewData && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface/50 rounded-2xl border border-gray-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Scan complete for</p>
                  <p className="text-lg font-semibold text-text-primary">{previewData.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Overall Score</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 bg-clip-text text-transparent">
                    {previewData.overallScore}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 mb-8">
                {previewData.scores?.map((score: any) => (
                  <div key={score.category} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.id === score.category)?.icon}
                      <span className="text-text-primary">{categories.find(c => c.id === score.category)?.name}</span>
                    </div>
                    <span className={`text-lg font-semibold ${
                      score.value < 12.5 ? 'text-red-400' : 
                      score.value < 18.75 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {score.value}/25
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700/50 pt-6">
                {credits === 0 ? (
                  <div className="text-center">
                    <p className="text-text-secondary mb-4">
                      <span className="text-red-400 font-semibold">{previewData.criticalCount} critical</span> issues found
                    </p>
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/20 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl">🎉</span>
                        <span className="text-lg font-semibold text-white">First-time offer</span>
                      </div>
                      <p className="text-4xl font-bold text-white mb-1">$0.99</p>
                      <p className="text-text-secondary mb-4">for 5 AI SEO scans</p>
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl font-semibold transition-colors"
                      >
                        {checkoutLoading ? 'Loading...' : 'Buy 5 Scans - $0.99'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-center text-text-secondary mb-4">
                      <span className="text-red-400 font-semibold">{previewData.criticalCount} critical</span> issues found
                    </p>
                    <button
                      onClick={handleGetReport}
                      className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                    >
                      View Full Report ({credits} scans left)
                    </button>
                    {previewData.preview?.firstPurchaseBonus && (
                      <p className="text-center text-xs text-primary mt-3">
                        🎉 Special: Buy 5 scans for just $0.99 (first purchase only)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              The only scanner built for AI search
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              While others focus on outdated SEO, we analyze what ChatGPT, Perplexity, and SearchGPT actually need to cite your content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="p-6 bg-surface/50 rounded-xl border border-gray-700/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{cat.name}</h3>
                <p className="text-sm text-text-secondary">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Start free, pay less than a coffee when you're ready
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="p-8 bg-surface/50 rounded-2xl border border-gray-700/50">
              <div className="text-6xl font-bold text-text-primary mb-2">1</div>
              <p className="text-text-secondary mb-6">Free scan to get started</p>
              <div className="text-2xl font-bold text-emerald-400 mb-1">$0</div>
              <p className="text-sm text-text-secondary">No credit card needed</p>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                BEST VALUE
              </div>
              <div className="text-6xl font-bold text-white mb-2">5</div>
              <p className="text-text-secondary mb-6">Scans per purchase</p>
              <div className="text-2xl font-bold text-primary mb-1">$0.99</div>
              <p className="text-sm text-text-secondary">First purchase only</p>
              <p className="text-xs text-primary mt-2">~$0.20 per scan</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-surface/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-text-primary">AISEO Scanner</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
            </div>
            
            <p className="text-sm text-text-secondary">
              © 2026 AISEO Scanner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
