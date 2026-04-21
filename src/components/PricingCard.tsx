'use client'

interface PricingCardProps {
  title: string
  price: number
  credits: number
  pricePerScan: number
  features: string[]
  popular?: boolean
  onSelect: () => void
}

export default function PricingCard({ 
  title, 
  price, 
  credits, 
  pricePerScan, 
  features, 
  popular = false,
  onSelect 
}: PricingCardProps) {
  return (
    <div className={`
      relative rounded-2xl p-6 border transition-all duration-300
      ${popular 
        ? 'bg-gradient-to-b from-primary/20 to-surface border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
        : 'bg-surface/50 border-gray-700/50 hover:border-gray-600 hover:shadow-lg'
      }
    `}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-semibold text-white">
          MOST POPULAR
        </div>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-text-primary">${price}</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {credits} scans · ${pricePerScan.toFixed(2)} per scan
        </p>
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      
      <button
        onClick={onSelect}
        className={`
          w-full py-3 rounded-lg font-semibold transition-all duration-300
          ${popular 
            ? 'bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]' 
            : 'bg-gray-700 hover:bg-gray-600'
          }
          active:scale-95
        `}
      >
        {popular ? 'Get Started' : 'Select'}
      </button>
    </div>
  )
}
