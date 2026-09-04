const HASH_KEY = 'classPhotoWall.pinHash'
const UNLOCK_KEY = 'classPhotoWall.unlocked'

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function hasPin(): boolean {
  return Boolean(localStorage.getItem(HASH_KEY))
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCK_KEY) === '1'
}

export function lockSession(): void {
  sessionStorage.removeItem(UNLOCK_KEY)
}

export async function setPin(pin: string): Promise<void> {
  const trimmed = pin.trim()
  if (trimmed.length < 4) throw new Error('PIN must be at least 4 characters')
  localStorage.setItem(HASH_KEY, await sha256Hex(trimmed))
  sessionStorage.setItem(UNLOCK_KEY, '1')
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(HASH_KEY)
  if (!stored) return false
  const ok = (await sha256Hex(pin.trim())) === stored
  if (ok) sessionStorage.setItem(UNLOCK_KEY, '1')
  return ok
}

export function clearPin(): void {
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(UNLOCK_KEY)
}
