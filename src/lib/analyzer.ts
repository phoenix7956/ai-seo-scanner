export interface Issue {
  severity: 'critical' | 'high' | 'medium'
  category: 'schema' | 'content' | 'technical' | 'trust'
  title: string
  description: string
  fix: string
  code?: string
}

export interface ScanResult {
  url: string
  overallScore: number
  scores: {
    category: 'schema' | 'content' | 'technical' | 'trust'
    value: number
  }[]
  issues: Issue[]
  criticalCount: number
  scannedAt: string
}

export interface PageData {
  url: string
  html: string
  title: string
  metaDescription: string
  h1s: string[]
  h2s: string[]
  h3s: string[]
  links: { href: string; text: string }[]
  images: { src: string; alt: string }[]
  schemaMarkup: any[]
  hasHTTPS: boolean
  hasRobotsTxt: boolean
  hasSitemap: boolean
  loadSpeed: number
  hasMobileViewport: boolean
  wordCount: number
  authorInfo: string[]
  jsonLdScripts: string[]
}

// Scoring weights
const CATEGORY_WEIGHTS = {
  schema: 25,
  content: 25,
  technical: 25,
  trust: 25
}

// Schema Analysis
function analyzeSchema(page: PageData): { score: number; issues: Issue[] } {
  const issues: Issue[] = []
  let deductions = 0

  // Check for JSON-LD
  if (page.schemaMarkup.length === 0) {
    deductions += 8
    issues.push({
      severity: 'critical',
      category: 'schema',
      title: 'No JSON-LD structured data found',
      description: 'AI search engines rely heavily on structured data to understand content context. Without JSON-LD, your content is harder for AI to cite accurately.',
      fix: 'Add JSON-LD schema markup to your pages. Start with Article or WebSite schema depending on your content type.',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://yoursite.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Organization",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yoursite.com/logo.png"
    }
  },
  "datePublished": "2026-01-01",
  "dateModified": "2026-01-01"
}
</script>`
    })
  }

  // Check for Article schema
  const hasArticleSchema = page.schemaMarkup.some(s => 
    s['@type'] === 'Article' || s['@type'] === 'BlogPosting' || s['@type'] === 'NewsArticle'
  )
  if (!hasArticleSchema && page.schemaMarkup.length > 0) {
    deductions += 4
    issues.push({
      severity: 'high',
      category: 'schema',
      title: 'Missing Article schema',
      description: 'Article schema helps AI engines understand your content structure, authorship, and publication dates.',
      fix: 'Add Article or BlogPosting schema to your content pages.',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your Post Title",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2026-01-01"
}
</script>`
    })
  }

  // Check for FAQ schema
  const hasFAQSchema = page.schemaMarkup.some(s => s['@type'] === 'FAQPage')
  if (!hasFAQSchema && page.h2s.length >= 3) {
    deductions += 3
    issues.push({
      severity: 'medium',
      category: 'schema',
      title: 'No FAQ schema detected',
      description: 'FAQ schema helps AI engines extract direct answers from your content for featured snippets and citations.',
      fix: 'Add FAQ schema if your page contains question-answer content.',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Your Question Here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your answer here."
      }
    }
  ]
}
</script>`
    })
  }

  // Check for Organization schema
  const hasOrgSchema = page.schemaMarkup.some(s => s['@type'] === 'Organization')
  if (!hasOrgSchema) {
    deductions += 5
    issues.push({
      severity: 'high',
      category: 'schema',
      title: 'Missing Organization schema',
      description: 'Organization schema helps AI establish who is behind the content, building trust and credibility signals.',
      fix: 'Add Organization schema to your homepage or global scripts.',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourprofile",
    "https://linkedin.com/company/yourcompany"
  ]
}
</script>`
    })
  }

  // Check for Open Graph tags
  const hasOGTags = page.html.includes('og:title') && page.html.includes('og:description') && page.html.includes('og:image')
  if (!hasOGTags) {
    deductions += 3
    issues.push({
      severity: 'medium',
      category: 'schema',
      title: 'Missing Open Graph meta tags',
      description: 'Open Graph tags control how your content appears when shared on social media and some AI systems.',
      fix: 'Add Open Graph meta tags to your <head> section.',
      code: `<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your description">
<meta property="og:image" content="https://yoursite.com/og-image.jpg">
<meta property="og:url" content="https://yoursite.com/page">
<meta property="og:type" content="website">`
    })
  }

  const score = Math.max(0, CATEGORY_WEIGHTS.schema - deductions)
  return { score, issues }
}

// Content Quality Analysis
function analyzeContent(page: PageData): { score: number; issues: Issue[] } {
  const issues: Issue[] = []
  let deductions = 0

  // Check for H1
  if (page.h1s.length === 0) {
    deductions += 8
    issues.push({
      severity: 'critical',
      category: 'content',
      title: 'No H1 heading found',
      description: 'H1 headings are crucial for AI to understand the main topic of your page. Every page should have exactly one H1.',
      fix: 'Add a single H1 heading that clearly describes the main topic of your page.',
      code: `<h1>Your Main Topic Here</h1>`
    })
  } else if (page.h1s.length > 1) {
    deductions += 3
    issues.push({
      severity: 'high',
      category: 'content',
      title: 'Multiple H1 headings found',
      description: 'Having multiple H1 headings confuses AI about your page\'s main topic.',
      fix: 'Use only one H1 per page. Use H2-H6 for subheadings.',
    })
  }

  // Check for FAQ content (H2 questions)
  const hasFAQs = page.h2s.some(h => h.includes('?') || h.toLowerCase().includes('faq') || h.toLowerCase().includes('question'))
  if (!hasFAQs && page.wordCount > 500) {
    deductions += 4
    issues.push({
      severity: 'medium',
      category: 'content',
      title: 'No FAQ section detected',
      description: 'FAQ sections are highly valued by AI search engines as they provide direct, structured answers.',
      fix: 'Consider adding a FAQ section with common questions and answers related to your content.',
    })
  }

  // Check heading hierarchy
  const hasH2 = page.h2s.length > 0
  const hasH3 = page.h3s.length > 0
  if (!hasH2) {
    deductions += 4
    issues.push({
      severity: 'high',
      category: 'content',
      title: 'No H2 subheadings found',
      description: 'H2 headings help AI understand the structure and key topics covered in your content.',
      fix: 'Break your content into logical sections using H2 headings.',
    })
  }

  // Check content length
  if (page.wordCount < 300) {
    deductions += 6
    issues.push({
      severity: 'high',
      category: 'content',
      title: 'Content may be too thin',
      description: 'AI search engines prefer comprehensive content. Very short pages may not provide enough context for citation.',
      fix: 'Aim for at least 300-500 words of substantive content per page.',
    })
  } else if (page.wordCount < 600) {
    deductions += 2
    issues.push({
      severity: 'medium',
      category: 'content',
      title: 'Content could be more comprehensive',
      description: 'Longer, in-depth content tends to perform better in AI search results.',
      fix: 'Consider expanding your content to provide more comprehensive coverage of the topic.',
    })
  }

  // Check for author attribution
  if (page.authorInfo.length === 0) {
    deductions += 5
    issues.push({
      severity: 'high',
      category: 'content',
      title: 'No author information found',
      description: 'AI engines value author expertise and credibility. Author attribution builds trust with AI systems.',
      fix: 'Include author bio or byline on your content pages.',
      code: `<div class="author">
  <img src="/author-photo.jpg" alt="Author Name">
  <div>
    <strong>Author Name</strong>
    <p>Author bio with expertise details...</p>
  </div>
</div>`
    })
  }

  // Check for images without alt text
  const imagesWithoutAlt = page.images.filter(img => !img.alt || img.alt.trim() === '')
  if (imagesWithoutAlt.length > 0) {
    deductions += 3
    issues.push({
      severity: 'medium',
      category: 'content',
      title: `${imagesWithoutAlt.length} image(s) missing alt text`,
      description: 'Alt text helps AI understand image content and improves accessibility.',
      fix: 'Add descriptive alt text to all images.',
      code: `<img src="image.jpg" alt="Description of image content">`
    })
  }

  const score = Math.max(0, CATEGORY_WEIGHTS.content - deductions)
  return { score, issues }
}

// Technical SEO Analysis
function analyzeTechnical(page: PageData): { score: number; issues: Issue[] } {
  const issues: Issue[] = []
  let deductions = 0

  // Check HTTPS
  if (!page.hasHTTPS) {
    deductions += 10
    issues.push({
      severity: 'critical',
      category: 'technical',
      title: 'Website is not using HTTPS',
      description: 'HTTPS is a strong trust signal for AI search engines. All reputable AI systems prefer secure sites.',
      fix: 'Install an SSL certificate and redirect HTTP to HTTPS.',
    })
  }

  // Check meta description
  if (!page.metaDescription || page.metaDescription.trim() === '') {
    deductions += 4
    issues.push({
      severity: 'high',
      category: 'technical',
      title: 'Missing meta description',
      description: 'Meta descriptions help AI understand page summaries and improve click-through rates from search results.',
      fix: 'Add a meta description to your page.',
      code: `<meta name="description" content="A concise summary of your page content (150-160 characters).">`
    })
  }

  // Check mobile viewport
  if (!page.hasMobileViewport) {
    deductions += 5
    issues.push({
      severity: 'high',
      category: 'technical',
      title: 'Missing viewport meta tag',
      description: 'Mobile-first indexing is standard. AI engines expect mobile-friendly pages.',
      fix: 'Add viewport meta tag to your <head>.',
      code: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    })
  }

  // Check page title
  if (!page.title || page.title.trim() === '') {
    deductions += 5
    issues.push({
      severity: 'critical',
      category: 'technical',
      title: 'Missing page title',
      description: 'Page titles are critical for AI to understand what your page is about.',
      fix: 'Add a descriptive <title> tag to your <head> section.',
      code: `<title>Your Page Title | Brand Name</title>`
    })
  }

  // Check for sitemap
  if (!page.hasSitemap) {
    deductions += 2
    issues.push({
      severity: 'medium',
      category: 'technical',
      title: 'No XML sitemap detected',
      description: 'Sitemaps help AI engines discover and crawl your pages more efficiently.',
      fix: 'Create an XML sitemap and submit it to search engines.',
      code: `<!-- Add to your robots.txt -->
Sitemap: https://yoursite.com/sitemap.xml`
    })
  }

  // Check for robots.txt
  if (!page.hasRobotsTxt) {
    deductions += 1
    issues.push({
      severity: 'medium',
      category: 'technical',
      title: 'No robots.txt found',
      description: 'Robots.txt helps guide AI crawlers to important pages and away from duplicate content.',
      fix: 'Create a robots.txt file in your root directory.',
      code: `User-agent: *
Allow: /
Sitemap: https://yoursite.com/sitemap.xml`
    })
  }

  // Check internal links
  if (page.links.length < 3) {
    deductions += 3
    issues.push({
      severity: 'medium',
      category: 'technical',
      title: 'Few internal links found',
      description: 'Internal links help AI understand your site structure and content relationships.',
      fix: 'Add internal links to related content on your site.',
    })
  }

  const score = Math.max(0, CATEGORY_WEIGHTS.technical - deductions)
  return { score, issues }
}

// Trust Signals Analysis
function analyzeTrust(page: PageData): { score: number; issues: Issue[] } {
  const issues: Issue[] = []
  let deductions = 0

  // Check for About page link
  const hasAboutLink = page.links.some(l => 
    l.href.toLowerCase().includes('about') || l.text.toLowerCase().includes('about')
  )
  if (!hasAboutLink) {
    deductions += 6
    issues.push({
      severity: 'high',
      category: 'trust',
      title: 'No visible About page link',
      description: 'About pages help AI verify your organization\'s identity and expertise - crucial for E-A-T signals.',
      fix: 'Add a link to your About page in your navigation or footer.',
    })
  }

  // Check for Contact information
  const hasContactInfo = page.links.some(l => 
    l.href.toLowerCase().includes('contact') || 
    l.text.toLowerCase().includes('contact') ||
    page.html.toLowerCase().includes('contact@') ||
    page.html.toLowerCase().includes('phone:')
  )
  if (!hasContactInfo) {
    deductions += 6
    issues.push({
      severity: 'high',
      category: 'trust',
      title: 'No contact information found',
      description: 'Contact info signals legitimacy to AI engines. It\'s a key trust factor for E-A-T.',
      fix: 'Include contact information on your site - email, phone, or address.',
      code: `<div class="contact-info">
  <p>📧 contact@yoursite.com</p>
  <p>📍 123 Main St, City, Country</p>
  <p>📞 +1 (555) 123-4567</p>
</div>`
    })
  }

  // Check for Privacy Policy
  const hasPrivacyPolicy = page.links.some(l => 
    l.href.toLowerCase().includes('privacy') || 
    l.text.toLowerCase().includes('privacy')
  )
  if (!hasPrivacyPolicy) {
    deductions += 5
    issues.push({
      severity: 'high',
      category: 'trust',
      title: 'No Privacy Policy page',
      description: 'Privacy policies are expected by AI engines and legal requirements. Missing one hurts trust signals.',
      fix: 'Create a Privacy Policy page and link to it in your footer.',
    })
  }

  // Check for social media presence (mentioned in HTML)
  const hasSocialLinks = page.html.includes('twitter.com') || 
                         page.html.includes('linkedin.com') || 
                         page.html.includes('facebook.com') ||
                         page.html.includes('github.com')
  if (!hasSocialLinks) {
    deductions += 4
    issues.push({
      severity: 'medium',
      category: 'trust',
      title: 'No social media links detected',
      description: 'Social media presence helps AI verify your credibility and online footprint.',
      fix: 'Add links to your social media profiles in your footer or About page.',
      code: `<div class="social-links">
  <a href="https://twitter.com/yourprofile">Twitter</a>
  <a href="https://linkedin.com/company/yourcompany">LinkedIn</a>
</div>`
    })
  }

  // Check for HTTPS (already checked in technical, but double-dip here)
  if (page.hasHTTPS) {
    deductions -= 2 // Bonus back for HTTPS
  }

  const score = Math.max(0, Math.min(25, CATEGORY_WEIGHTS.trust - deductions))
  return { score, issues }
}

export function analyzePage(page: PageData): ScanResult {
  const schemaResult = analyzeSchema(page)
  const contentResult = analyzeContent(page)
  const technicalResult = analyzeTechnical(page)
  const trustResult = analyzeTrust(page)

  const scores = [
    { category: 'schema' as const, value: schemaResult.score },
    { category: 'content' as const, value: contentResult.score },
    { category: 'technical' as const, value: technicalResult.score },
    { category: 'trust' as const, value: trustResult.score }
  ]

  const allIssues = [
    ...schemaResult.issues,
    ...contentResult.issues,
    ...technicalResult.issues,
    ...trustResult.issues
  ]

  const overallScore = Math.round(
    scores.reduce((sum, s) => sum + s.value, 0) / scores.length * 4
  )

  const criticalCount = allIssues.filter(i => i.severity === 'critical').length

  return {
    url: page.url,
    overallScore,
    scores,
    issues: allIssues,
    criticalCount,
    scannedAt: new Date().toISOString()
  }
}
