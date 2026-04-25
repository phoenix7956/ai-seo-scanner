import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({} as SupabaseClient)

// Server-side client with service role (for webhooks and privileged ops)
export const supabaseAdmin: SupabaseClient = (supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : ({} as SupabaseClient)

export interface DbUser {
  id: string
  visitor_id: string
  credits: number
  is_first_purchase: boolean
  created_at: string
  updated_at: string
}

export interface DbScan {
  id: string
  user_id: string | null
  visitor_id: string
  url: string
  overall_score: number
  score_schema: number
  score_content: number
  score_technical: number
  score_trust: number
  critical_count: number
  issues: any
  is_paid: boolean
  credits_used: number
  created_at: string
}

export interface DbPurchase {
  id: string
  user_id: string | null
  visitor_id: string
  lemonsqueezy_order_id: string | null
  product_name: string | null
  credits_purchased: number
  amount_cents: number
  currency: string
  status: string
  created_at: string
}

/**
 * Get or create a user by visitor_id (browser cookie)
 */
export async function getOrCreateUser(visitorId: string): Promise<DbUser> {
  // Try to find existing user
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('visitor_id', visitorId)
    .single()
  
  if (existing) {
    return existing as DbUser
  }
  
  // Create new user with 1 free scan
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ visitor_id: visitorId, credits: 1, is_first_purchase: true })
    .select()
    .single()
  
  if (error) throw new Error(`Failed to create user: ${error.message}`)
  return newUser as DbUser
}

/**
 * Check if user has credits
 */
export async function hasCredits(visitorId: string): Promise<boolean> {
  const user = await getOrCreateUser(visitorId)
  return user.credits > 0
}

/**
 * Consume 1 credit
 */
export async function consumeCredit(visitorId: string): Promise<boolean> {
  const user = await getOrCreateUser(visitorId)
  if (user.credits <= 0) return false
  
  const { error } = await supabase
    .from('users')
    .update({ credits: user.credits - 1, updated_at: new Date().toISOString() })
    .eq('visitor_id', visitorId)
  
  if (error) throw new Error(`Failed to consume credit: ${error.message}`)
  return true
}

/**
 * Add credits to user
 */
export async function addCredits(visitorId: string, amount: number): Promise<void> {
  const user = await getOrCreateUser(visitorId)
  const { error } = await supabase
    .from('users')
    .update({ 
      credits: user.credits + amount, 
      is_first_purchase: false,
      updated_at: new Date().toISOString() 
    })
    .eq('visitor_id', visitorId)
  
  if (error) throw new Error(`Failed to add credits: ${error.message}`)
}

/**
 * Save a scan result
 */
export async function saveScan(params: {
  visitorId: string
  url: string
  overallScore: number
  scoreSchema: number
  scoreContent: number
  scoreTechnical: number
  scoreTrust: number
  criticalCount: number
  issues: any[]
  isPaid: boolean
}): Promise<DbScan> {
  const { data, error } = await supabase
    .from('scans')
    .insert({
      visitor_id: params.visitorId,
      url: params.url,
      overall_score: params.overallScore,
      score_schema: params.scoreSchema,
      score_content: params.scoreContent,
      score_technical: params.scoreTechnical,
      score_trust: params.scoreTrust,
      critical_count: params.criticalCount,
      issues: params.isPaid ? params.issues : [],
      is_paid: params.isPaid,
      credits_used: 1
    })
    .select()
    .single()
  
  if (error) throw new Error(`Failed to save scan: ${error.message}`)
  return data as DbScan
}

/**
 * Get scan by ID
 */
export async function getScan(scanId: string): Promise<DbScan | null> {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single()
  
  if (error) return null
  return data as DbScan
}

/**
 * Record a purchase
 */
export async function recordPurchase(params: {
  visitorId: string
  lemonsqueezyOrderId: string
  productName: string
  creditsPurchased: number
  amountCents: number
  status: string
}): Promise<DbPurchase> {
  const { data, error } = await supabase
    .from('purchases')
    .upsert({
      visitor_id: params.visitorId,
      lemonsqueezy_order_id: params.lemonsqueezyOrderId,
      product_name: params.productName,
      credits_purchased: params.creditsPurchased,
      amount_cents: params.amountCents,
      status: params.status
    }, {
      onConflict: 'lemonsqueezy_order_id'
    })
    .select()
    .single()
  
  if (error) throw new Error(`Failed to record purchase: ${error.message}`)
  return data as DbPurchase
}
