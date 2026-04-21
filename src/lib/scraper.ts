import * as cheerio from 'cheerio'
import { PageData } from './analyzer'

export async function scrapePage(url: string): Promise<PageData> {
  // Validate URL
  let targetUrl: URL
  try {
    targetUrl = new URL(url)
  } catch {
    throw new Error('Invalid URL provided')
  }

  // Use Cheerio to fetch and parse
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AISEO-Scanner/1.0 (+https://aiseoscan.dev/bot)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract title
  const title = $('title').first().text().trim()

  // Extract meta description
  const metaDescription = $('meta[name="description"]').attr('content') || ''

  // Extract headings
  const h1s: string[] = []
  $('h1').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h1s.push(text)
  })

  const h2s: string[] = []
  $('h2').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h2s.push(text)
  })

  const h3s: string[] = []
  $('h3').each((_, el) => {
    const text = $(el).text().trim()
    if (text) h3s.push(text)
  })

  // Extract links
  const links: { href: string; text: string }[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    if (href && text) {
      // Resolve relative URLs
      let fullHref = href
      if (href.startsWith('/')) {
        fullHref = `${targetUrl.origin}${href}`
      } else if (href.startsWith('./')) {
        fullHref = new URL(href, url).href
      }
      links.push({ href: fullHref, text })
    }
  })

  // Extract images with alt text
  const images: { src: string; alt: string }[] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    const alt = $(el).attr('alt') || ''
    if (src) {
      // Resolve relative URLs
      let fullSrc = src
      if (src.startsWith('/')) {
        fullSrc = `${targetUrl.origin}${src}`
      } else if (!src.startsWith('http')) {
        fullSrc = new URL(src, url).href
      }
      images.push({ src: fullSrc, alt })
    }
  })

  // Extract JSON-LD schema
  const jsonLdScripts: string[] = []
  const schemaMarkup: any[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html()
    if (content) {
      jsonLdScripts.push(content)
      try {
        // Handle CDATA if present
        let jsonStr = content.trim()
        if (jsonStr.startsWith('// <![CDATA[')) {
          jsonStr = jsonStr.replace(/^\/\/ <!\[CDATA\=/, '').replace(/\]\]>$/, '')
        }
        const parsed = JSON.parse(jsonStr)
        if (Array.isArray(parsed)) {
          schemaMarkup.push(...parsed)
        } else {
          schemaMarkup.push(parsed)
        }
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e)
      }
    }
  })

  // Check for HTTPS
  const hasHTTPS = targetUrl.protocol === 'https:'

  // Check for robots.txt
  let hasRobotsTxt = false
  try {
    const robotsResponse = await fetch(`${targetUrl.origin}/robots.txt`, {
      method: 'HEAD'
    })
    hasRobotsTxt = robotsResponse.ok
  } catch {
    hasRobotsTxt = false
  }

  // Check for sitemap
  let hasSitemap = false
  try {
    const sitemapResponse = await fetch(`${targetUrl.origin}/sitemap.xml`, {
      method: 'HEAD'
    })
    hasSitemap = sitemapResponse.ok
  } catch {
    hasSitemap = false
  }

  // Mobile viewport check
  const hasMobileViewport = $('meta[name="viewport"]').length > 0

  // Word count estimation
  $('script, style, nav, footer, header, aside').remove()
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length

  // Author info detection
  const authorInfo: string[] = []
  const authorSelectors = [
    'meta[name="author"]',
    'meta[property="article:author"]',
    '[rel="author"]',
    '.author',
    '.byline',
    '[itemprop="author"]'
  ]
  authorSelectors.forEach(sel => {
    $(sel).each((_, el) => {
      const text = $(el).attr('content') || $(el).text().trim()
      if (text && !authorInfo.includes(text)) {
        authorInfo.push(text)
      }
    })
  })

  return {
    url,
    html,
    title,
    metaDescription,
    h1s,
    h2s,
    h3s,
    links,
    images,
    schemaMarkup,
    hasHTTPS,
    hasRobotsTxt,
    hasSitemap,
    loadSpeed: 0, // Would need real measurement
    hasMobileViewport,
    wordCount,
    authorInfo,
    jsonLdScripts
  }
}
