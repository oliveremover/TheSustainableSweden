import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? ''
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function cookieOpts(maxAgeSec: number) {
  const secure = process.env.NODE_ENV === 'production'
  return `HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${
    secure ? '; Secure' : ''
  }`
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))
  const access_token = body?.access_token
  if (!access_token)
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 })
  if (!JWT_SECRET)
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const supabase = await createClient()

  // Verify the token with Supabase and get the auth user
  const { data: userResp, error: uErr } = await supabase.auth.getUser(access_token)
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })
  const user = userResp?.user ?? null
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  // Accept admin if app_metadata.role === 'admin' or email is in ADMIN_EMAILS
  const roleFromMetadata = (user?.app_metadata as any)?.role ?? null
  const isAdminByMetadata = roleFromMetadata === 'admin'
  const isAdminByAllowlist = user?.email
    ? ADMIN_EMAILS.includes(user.email)
    : false

  if (!isAdminByMetadata && !isAdminByAllowlist) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  const res = NextResponse.json({ ok: true, email: user.email, role: 'admin' })
  res.headers.append(
    'Set-Cookie',
    `admin_token=${encodeURIComponent(token)}; ${cookieOpts(7 * 24 * 60 * 60)}`
  )
  return res
}