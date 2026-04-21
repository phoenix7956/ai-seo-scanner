'use client'

import { useState } from 'react'

interface ScoreCardProps {
  title: string
  score: number
  maxScore?: number
  icon: React.ReactNode
  issues?: { severity: 'critical' | 'high' | 'medium'; title: string; description: string; fix: string; code?: string }[]
  isPaid?: boolean
}

export default function ScoreCard({ title, score, maxScore = 100, icon, issues = [], isPaid = false }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  const percentage = Math.round((score / maxScore) * 100) / 2 // 25 max per category
  const normalizedScore = Math.round(percentage)
  
  const getScoreColor = (s: number) => {
    if (s < 12.5) return 'bg-red-500'
    if (s < 18.75) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const severityOrder = { critical: 0, high: 1, medium: 2 }
  const sortedIssues = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return (
    <div className="bg-surface/50 rounded-xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-text-primary">{normalizedScore}</div>
            <div className="text-xs text-text-secondary">/ 25</div>
          </div>
          <svg 
            className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className="h-1 bg-gray-800">
        <div 
          className={`h-full transition-all duration-500 ${getScoreColor(normalizedScore)}`}
          style={{ width: `${(normalizedScore / 25) * 100}%` }}
        />
      </div>
      
      {expanded && (
        <div className="p-5 border-t border-gray-700/50">
          {isPaid ? (
            <div className="space-y-4">
              {sortedIssues.map((issue, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-background/50 border border-gray-700/30">
                  <div className="flex items-start gap-3">
                    <span className={`
                      w-2 h-2 rounded-full mt-2
                      ${issue.severity === 'critical' ? 'bg-red-500' : 
                        issue.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}
                    `} />
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{issue.title}</h4>
                      <p className="text-sm text-text-secondary mt-1">{issue.description}</p>
                      <div className="mt-3 p-3 rounded bg-surface/80 border border-gray-700/50">
                        <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Fix</p>
                        <p className="text-sm text-emerald-400">{issue.fix}</p>
                        {issue.code && (
                          <pre className="mt-2 p-2 rounded bg-black/30 text-xs text-gray-300 overflow-x-auto font-mono">
                            {issue.code}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-text-secondary mb-3">
                <span className="text-red-400 font-semibold">{issues.filter(i => i.severity === 'critical').length} critical</span>,{' '}
                <span className="text-orange-400 font-semibold">{issues.filter(i => i.severity === 'high').length} high</span>, and{' '}
                <span className="text-yellow-400 font-semibold">{issues.filter(i => i.severity === 'medium').length} medium</span> issues found
              </p>
              <p className="text-sm text-text-secondary">
                Unlock the full report to see detailed fixes and code examples
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
