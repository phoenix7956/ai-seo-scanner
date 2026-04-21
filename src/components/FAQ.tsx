'use client'

import { useState } from 'react'

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-gray-700/50 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-text-primary pr-4">{question}</span>
        <svg 
          className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <p className="text-text-secondary text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

const faqs = [
  {
    question: "What makes AISEOScan different from traditional SEO tools?",
    answer: "Traditional SEO tools focus on Google/Bing rankings. AISEOScan is specifically designed for AI search engines like ChatGPT, Claude, and Perplexity. We analyze your site's AI citation potential - whether AI systems can understand, trust, and reference your content."
  },
  {
    question: "What do I get with the $29 AI SEO audit?",
    answer: "A complete analysis across 4 dimensions: Schema Markup, Content Quality, Technical SEO, and Trust Signals. You'll receive a 0-100 score for each category, detailed issue reports with severity levels, actionable fix recommendations, and code examples you can implement immediately."
  },
  {
    question: "How does AI SEO differ from traditional SEO?",
    answer: "AI search engines use large language models to understand and synthesize content, rather than matching keywords. They look for structured data, clear expertise signals, E-A-T factors (Expertise, Authoritativeness, Trustworthiness), and content that answers questions directly. Traditional SEO keywords matter less."
  },
  {
    question: "Which AI search engines does this optimize for?",
    answer: "AISEOScan optimizes for ChatGPT (with browsing), Claude (via web discovery), Perplexity, SearchGPT, Google AI Overviews, and any other LLM-based search system. As AI search grows, being ready gives you a competitive advantage."
  },
  {
    question: "How long are reports available and do you store my data?",
    answer: "Paid reports are stored for 30 days and can be re-accessed anytime within that period. We don't store your scan data permanently or share it with third parties. Your website URL and results are deleted after the retention period."
  },
  {
    question: "What types of websites can you analyze for AI SEO?",
    answer: "AISEOScan works with any publicly accessible website - business sites, blogs, e-commerce stores, SaaS products, news sites, and more. The analysis focuses on on-page SEO factors that affect AI citation, so even single-page sites will get useful insights."
  },
  {
    question: "How often should I run an AI SEO analysis?",
    answer: "We recommend running an analysis after major content updates or site changes. For active sites, a monthly check-in is good practice to ensure new content meets AI SEO standards. Our scoring helps you track improvement over time."
  },
  {
    question: "What is your refund policy?",
    answer: "If you're not satisfied with your report, contact us within 7 days and we'll work to address your concerns. While individual scan results depend on your website's actual state, we're committed to helping you understand and improve your AI search visibility."
  }
]

export default function FAQ() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {faqs.map((faq, idx) => (
        <FAQItem key={idx} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  )
}
