// src/lib/api/auth.ts
// Helpers for verifying partner API keys on inbound requests.
//
// Usage in a route handler:
//
//   import { verifyKey, logRequest, jsonError } from '@/lib/api/auth'
//
//   export async function GET(req: Request) {
//     const auth = await verifyKey(req, 'read_listings')
//     if (!auth.ok) return auth.response
//     const { ownerId, keyId } = auth
//     // ... do the work, return data ...
//     await logRequest(req, keyId, ownerId, 200, Date.now() - start)
//   }

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'

export type ApiScope =
  | 'read_listings'
  | 'read_availability'
  | 'read_bookings'
  | 'read_pricing'
  | 'write_bookings'

// We use the service role here because the partner is authenticated via
// their own bearer token, not a Supabase JWT — so RLS isn't appropriate.
// The route handler is responsible for scoping every query by owner_id.
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/** Generate a new plaintext API key. */
export function newPlaintextKey(): { plaintext: string; hash: string; last4: string } {
  const token = randomBytes(24).toString('hex')      // 48 chars
  const plaintext = `dredott_pk_${token}`
  return {
    plaintext,
    hash: sha256(plaintext),
    last4: plaintext.slice(-4),
  }
}

interface VerifyOk {
  ok: true
  ownerId: string
  keyId: string
  rateLimit: number
}
interface VerifyFail {
  ok: false
  response: Response
}

export async function verifyKey(req: Request, scope: ApiScope): Promise<VerifyOk | VerifyFail> {
  const header = req.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return { ok: false, response: jsonError(401, 'missing_bearer_token',
      'Send `Authorization: Bearer dredott_pk_…` with every request.') }
  }
  const plaintext = match[1].trim()
  if (!plaintext.startsWith('dredott_pk_')) {
    return { ok: false, response: jsonError(401, 'invalid_token_format',
      'API keys start with `dredott_pk_`.') }
  }

  const supabase = serviceClient()
  const { data, error } = await supabase.rpc('verify_api_key', {
    p_key_hash: sha256(plaintext),
    p_scope: scope,
  })
  if (error) {
    console.error('[api] verify_api_key error:', error.message)
    return { ok: false, response: jsonError(500, 'verify_failed', 'Internal error.') }
  }
  if (!data || data.length === 0) {
    return { ok: false, response: jsonError(403, 'forbidden',
      `This key is invalid, revoked, or missing the "${scope}" scope.`) }
  }
  const row = data[0]

  // ── Rate limit: count requests in the last 60 seconds ───────
  const since = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase
    .from('api_request_log')
    .select('id', { count: 'exact', head: true })
    .eq('api_key_id', row.api_key_id)
    .gte('created_at', since)
  const limit = row.rate_limit_per_min ?? 60
  if ((count ?? 0) >= limit) {
    return { ok: false, response: jsonError(429, 'rate_limited',
      `You're allowed ${limit} requests per minute.`, { 'retry-after': '60' }) }
  }

  // Bump last_used_at (fire-and-forget)
  void supabase.from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', row.api_key_id)

  return {
    ok: true,
    ownerId: row.owner_id,
    keyId: row.api_key_id,
    rateLimit: limit,
  }
}

export async function logRequest(
  req: Request,
  keyId: string | null,
  ownerId: string | null,
  statusCode: number,
  responseMs: number,
) {
  try {
    const url = new URL(req.url)
    const supabase = serviceClient()
    await supabase.from('api_request_log').insert({
      api_key_id: keyId,
      owner_id: ownerId,
      method: req.method,
      path: url.pathname,
      status_code: statusCode,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      user_agent: req.headers.get('user-agent'),
      response_ms: responseMs,
    })
  } catch (e) {
    console.error('[api] log error:', e)
  }
}

interface JsonErrorBody { error: string; message: string }
export function jsonError(
  status: number, error: string, message: string,
  extraHeaders: Record<string, string> = {},
): Response {
  const body: JsonErrorBody = { error, message }
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}

export function jsonOk(body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}
