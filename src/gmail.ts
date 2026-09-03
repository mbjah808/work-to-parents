const GMAIL_SEND = 'https://www.googleapis.com/auth/gmail.send'
const USERINFO = 'https://www.googleapis.com/auth/userinfo.email'
const SCOPES = `${GMAIL_SEND} ${USERINFO}`
const TOKEN_KEY = 'w2p-google-token'

type StoredToken = { accessToken: string; expiresAt: number; email?: string }

function clientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
}

export function googleConfigured(): boolean {
  return clientId().length > 0
}

function loadToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const t = JSON.parse(raw) as StoredToken
    if (!t.accessToken || t.expiresAt < Date.now() + 30_000) return null
    return t
  } catch {
    return null
  }
}

function saveToken(t: StoredToken): void {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t))
}

export function signedInEmail(): string | null {
  return loadToken()?.email ?? null
}

export function isSignedIn(): boolean {
  return loadToken() !== null
}

export function signOut(): void {
  const t = loadToken()
  sessionStorage.removeItem(TOKEN_KEY)
  if (t && window.google?.accounts.oauth2.revoke) {
    window.google.accounts.oauth2.revoke(t.accessToken)
  }
}

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.dataset.gis = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(s)
  })
}

async function fetchEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return undefined
    const data = (await res.json()) as { email?: string }
    return data.email
  } catch {
    return undefined
  }
}

export async function signIn(): Promise<string> {
  if (!googleConfigured()) {
    throw new Error('Google client ID is not set. Add VITE_GOOGLE_CLIENT_ID (see README).')
  }
  await loadGis()
  if (!window.google) throw new Error('Google Sign-In is not available')

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId(),
      scope: SCOPES,
      callback: (resp) => {
        void (async () => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error || 'Google sign-in was cancelled'))
            return
          }
          const expiresIn = Number(resp.expires_in || 3600)
          const email = await fetchEmail(resp.access_token)
          saveToken({
            accessToken: resp.access_token,
            expiresAt: Date.now() + expiresIn * 1000,
            email,
          })
          resolve(email || 'signed in')
        })()
      },
    })
    client.requestAccessToken({ prompt: 'consent' })
  })
}

function base64Url(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < buf.length; i += chunk) {
    bin += String.fromCharCode(...buf.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export async function sendWorkEmail(opts: {
  to: string
  studentName: string
  photo: Blob
  filename: string
}): Promise<void> {
  const token = loadToken()
  if (!token) throw new Error('Not signed in to Google')

  const boundary = `w2p_${crypto.randomUUID().replace(/-/g, '')}`
  const mime = opts.photo.type || 'image/jpeg'
  const b64 = await blobToBase64(opts.photo)
  const wrapped = b64.replace(/(.{76})/g, '$1\r\n')
  const subject = `${opts.studentName} — classroom work`
  const body = `Aloha,\r\n\r\nAttached is classroom work from ${opts.studentName}.\r\n\r\nSent from Work to Parents.\r\n`

  const mimeMsg = [
    `To: ${headerSafe(opts.to)}`,
    `Subject: ${headerSafe(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    `--${boundary}`,
    `Content-Type: ${mime}; name="${headerSafe(opts.filename)}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${headerSafe(opts.filename)}"`,
    '',
    wrapped,
    `--${boundary}--`,
    '',
  ].join('\r\n')

  const raw = base64Url(new TextEncoder().encode(mimeMsg))
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })
  if (!res.ok) {
    const errText = await res.text()
    if (res.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY)
      throw new Error('Google session expired. Sign in again.')
    }
    throw new Error(`Gmail send failed (${res.status}). ${errText.slice(0, 180)}`)
  }
}
