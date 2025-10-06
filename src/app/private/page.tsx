import { createClient } from '@/utils/supabase/server'

export default async function PrivatePage() {
  const supabase = await createClient()

  // Do not redirect anonymous users. We optionally show who is signed in.
  // Admin-only actions remain protected server-side in the /api/admin/* routes.
  const { data } = await supabase.auth.getUser().catch(() => ({} as any))
  const email = data?.user?.email ?? null

  if (!email) {
    return (
      <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
        <h2>Private area</h2>
        <p style={{ marginTop: 8 }}>
          This page contains additional information for signed-in admins. The main site is public and
          does not require authentication.
        </p>
        <div style={{ marginTop: 16 }}>
          <a href="/pages/login" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 12px", borderRadius: 6 }}>Admin sign in</button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h2>Private area</h2>
      <p style={{ marginTop: 8 }}>Hello {email} — you are signed in.</p>
      <p style={{ marginTop: 12 }}>Admin actions are available via the admin UI or server APIs.</p>
    </div>
  )
}