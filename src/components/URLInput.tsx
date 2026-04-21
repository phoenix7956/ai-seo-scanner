'use client'

import { useState } from 'react'

interface URLInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function URLInput({ onSubmit, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let normalizedUrl = url.trim()
    if (!normalizedUrl) {
      setError('Please enter a website URL')
      return
    }
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }
    
    // Basic URL validation
    try {
      new URL(normalizedUrl)
    } catch {
      setError('Please enter a valid URL (e.g., example.com)')
      return
    }
    
    setError('')
    onSubmit(normalizedUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          placeholder="Enter website URL (e.g., example.com)"
          disabled={isLoading}
          className={`
            w-full pl-12 pr-32 py-4 text-lg
            bg-surface/50 border-2 rounded-xl
            placeholder:text-gray-500
            transition-all duration-300
            focus:outline-none focus:ring-0
            ${error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-600 focus:border-primary hover:border-gray-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            px-6 py-2.5 rounded-lg font-semibold
            transition-all duration-300
            ${isLoading 
              ? 'bg-primary/50 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scanning...
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400 pl-2">{error}</p>
      )}
      
      {isLoading && (
        <div className="mt-4 h-1 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-scan rounded-full" />
        </div>
      )}
    </form>
  )
}
