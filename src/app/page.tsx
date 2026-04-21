'use client'

import { useState } from 'react'
import URLInput from '@/components/URLInput'
import ScoreCard from '@/components/ScoreCard'
import PricingCard from '@/components/PricingCard'
import FAQ from '@/components/FAQ'

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

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPricing, setShowPricing] = useState(false)

  const handleScan = async (url: string) => {
    setIsScanning(true)
    setShowPreview(false)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      
      if (data.scanId) {
        setPreviewData(data)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleGetReport = async () => {
    if (!previewData?.scanId) return
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: previewData.scanId })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    }
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
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => setShowPricing(true)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Pricing
            </button>
            <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </header>

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
              No signup required
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
                {previewData.scores?.map((score: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {categories.find(c => c.id === score.category)?.icon}
                      <span className="text-text-primary">{categories.find(c => c.id === score.category)?.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-semibold ${
                        score.value < 12.5 ? 'text-red-400' : 
                        score.value < 18.75 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {score.value}/25
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700/50 pt-6">
                <p className="text-center text-text-secondary mb-4">
                  <span className="text-red-400 font-semibold">{previewData.criticalCount} critical</span> issues found
                </p>
                <button
                  onClick={handleGetReport}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  Unlock Full Report - $29
                </button>
                <p className="text-center text-xs text-text-secondary mt-3">
                  See detailed fixes, code examples, and implementation guides
                </p>
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
                className="p-6 bg-surface/50 rounded-xl border border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
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

      {/* Why AI SEO Matters */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                The search landscape has fundamentally changed
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                AI engines like ChatGPT, Perplexity, and SearchGPT are becoming the primary way people find information. 
                Is your content optimized for this new reality?
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    89%
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Of searches now use AI engines</p>
                    <p className="text-sm text-text-secondary">Traditional search is declining fast</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                    5x
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">More traffic for AI-optimized content</p>
                    <p className="text-sm text-text-secondary">Early movers get the advantage</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    73%
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Of websites aren't AI-optimized</p>
                    <p className="text-sm text-text-secondary">Huge opportunity gap</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-surface to-secondary/20 border border-gray-700/50 p-8 flex flex-col justify-center">
                <div className="text-center mb-8">
                  <p className="text-sm text-text-secondary uppercase tracking-wide mb-2">Your AI Citation Score</p>
                  <p className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ?
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 bg-background/50 rounded-lg text-center">
                      <div className="w-8 h-8 mx-auto mb-2 text-primary">{cat.icon}</div>
                      <p className="text-xs text-text-secondary">{cat.name}</p>
                      <p className="text-lg font-semibold text-text-primary">?/25</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <p className="text-sm text-primary font-medium">
                    Run your first scan to find out
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Modal */}
      {showPricing && (
        <section className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
              <button 
                onClick={() => setShowPricing(false)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                title="Single Scan"
                price={29}
                credits={1}
                pricePerScan={29}
                features={[
                  'Complete AI SEO analysis',
                  'Full issue breakdown',
                  'Implementation guides',
                  'Schema markup templates',
                  'PDF download',
                  '30-day report access'
                ]}
                onSelect={() => setShowPricing(false)}
              />
              
              <PricingCard
                title="Starter"
                price={119}
                credits={5}
                pricePerScan={23.80}
                features={[
                  'Complete AI SEO analysis',
                  'Full issue breakdown',
                  'Implementation guides',
                  'Schema markup templates',
                  'PDF downloads',
                  '30-day report access',
                  'Save 18%'
                ]}
                popular={true}
                onSelect={() => setShowPricing(false)}
              />
              
              <PricingCard
                title="Agency"
                price={199}
                credits={10}
                pricePerScan={19.90}
                features={[
                  'Complete AI SEO analysis',
                  'Full issue breakdown',
                  'Implementation guides',
                  'Schema markup templates',
                  'PDF downloads',
                  '30-day report access',
                  'Save 31%',
                  'Priority support'
                ]}
                onSelect={() => setShowPricing(false)}
              />
            </div>
          </div>
        </section>
      )}

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
