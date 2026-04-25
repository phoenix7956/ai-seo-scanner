import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, recordPurchase } from '@/lib/supabase'

// LemonSqueezy API client
const LS_API = 'https://api.lemonsqueezy.com/v1'
const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY

interface LSOrder {
  data: {
    id: string
    attributes: {
      identifier: string
      order_number: number
      user_email: string
      total: number
      subtotal: number
      currency: string
      status: string
      created_at: string
    }
  }
}

async function lsFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${LS_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LS_API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      ...options.headers
    }
  })
  return res
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, scanId } = body

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId is required' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await getOrCreateUser(visitorId)

    // Determine which product to offer
    const isFirstPurchase = user.is_first_purchase
    const creditsOffer = 5
    const priceInCents = isFirstPurchase ? 99 : 900 // $0.99 first / $9 regular

    // Create LemonSqueezy checkout
    const checkoutRes = await lsFetch('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: `visitor-${visitorId}@aiseoscan.dev`, // placeholder
              custom: {
                visitor_id: visitorId,
                credits: creditsOffer
              }
            },
            product_options: {
              name: isFirstPurchase 
                ? 'AISEO Starter Pack - First Offer (5 Scans)' 
                : 'AISEO 5 Additional Scans',
              description: isFirstPurchase
                ? '🎉 Special first-time offer: 5 AI SEO scans for just $0.99'
                : '5 additional AI SEO scan credits',
              price: priceInCents,
              price_type: 'fixed',
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success&visitorId=${visitorId}`,
              receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success&visitorId=${visitorId}`,
            },
            checkout_options: {
              button_color: '#6366F1',
              dark: true
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMONSQUEEZY_STORE_ID!
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: isFirstPurchase 
                  ? process.env.LEMONSQUEEZY_VARIANT_FIRST! 
                  : process.env.LEMONSQUEEZY_VARIANT_REGULAR!
              }
            }
          }
        }
      })
    })

    const checkoutData = await checkoutRes.json()

    if (!checkoutRes.ok) {
      console.error('LemonSqueezy error:', checkoutData)
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 500 }
      )
    }

    // Extract checkout URL
    const checkoutUrl = checkoutData.data.attributes.url
    const checkoutId = checkoutData.data.id

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
      credits: creditsOffer,
      price: isFirstPurchase ? 0.99 : 9
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
