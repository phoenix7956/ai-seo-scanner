import { NextRequest, NextResponse } from 'next/server'
import { recordPurchase, addCredits, getOrCreateUser } from '@/lib/supabase'
import crypto from 'crypto'

// Verify LemonSqueezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')
    const eventName = request.headers.get('x-event-name')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 })
    }

    // Verify webhook authenticity
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    console.log('LS Webhook event:', eventName, JSON.stringify(payload, null, 2))

    // Handle order completed event
    if (eventName === 'order_created' || eventName === 'order_paid') {
      const orderData = payload.meta?.custom_data
      const visitorId = orderData?.visitor_id
      const creditsAmount = parseInt(orderData?.credits || '5', 10)

      if (!visitorId) {
        console.error('No visitor_id in webhook payload:', payload)
        return NextResponse.json({ error: 'No visitor_id' }, { status: 400 })
      }

      const orderId = payload.data?.id?.toString() || 
                      payload.attributes?.identifier ||
                      `unknown-${Date.now()}`

      // Record purchase
      await recordPurchase({
        visitorId,
        lemonsqueezyOrderId: orderId,
        productName: 'AISEO Credits Pack',
        creditsPurchased: creditsAmount,
        amountCents: payload.data?.attributes?.total || 99,
        status: 'completed'
      })

      // Add credits to user
      await addCredits(visitorId, creditsAmount)

      console.log(`✅ Added ${creditsAmount} credits to visitor ${visitorId} for order ${orderId}`)

      return NextResponse.json({ 
        success: true, 
        creditsAdded: creditsAmount,
        visitorId 
      })
    }

    // Order refunded - could optionally remove credits (skip for now)
    if (eventName === 'order_refunded') {
      console.log('Order refunded event received (not processing)')
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
