import { fetchCloudPinHash, saveCloudPinHash, supabaseConfigured } from './supabase-store'

const HASH_KEY = 'classPhotoWall.pinHash'
const UNLOCK_KEY = 'classPhotoWall.unlocked'

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function localHash(): string | null {
  return localStorage.getItem(HASH_KEY)
}

function cacheLocalHash(hash: string): void {
  localStorage.setItem(HASH_KEY, hash)
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCK_KEY) === '1'
}

export function lockSession(): void {
  sessionStorage.removeItem(UNLOCK_KEY)
}

/** Resolve whether a class PIN exists (cloud preferred; migrates local → cloud). */
export async function resolvePinPresence(): Promise<boolean> {
  if (!supabaseConfigured()) {
    return Boolean(localHash())
  }

  try {
    const cloud = await fetchCloudPinHash()
    if (cloud) {
      cacheLocalHash(cloud)
      return true
    }
  } catch {
    // Fall through to local on cloud errors
  }

  const local = localHash()
  if (local) {
    try {
      await saveCloudPinHash(local)
    } catch {
      // Still treat local PIN as present if migrate fails
    }
    return true
  }

  return false
}

export async function setPin(pin: string): Promise<void> {
  const trimmed = pin.trim()
  if (trimmed.length < 4) throw new Error('PIN must be at least 4 characters')
  const hash = await sha256Hex(trimmed)
  if (supabaseConfigured()) {
    await saveCloudPinHash(hash)
  }
  cacheLocalHash(hash)
  sessionStorage.setItem(UNLOCK_KEY, '1')
}

export async function verifyPin(pin: string): Promise<boolean> {
  let stored = localHash()

  if (supabaseConfigured()) {
    try {
      const cloud = await fetchCloudPinHash()
      if (cloud) {
        cacheLocalHash(cloud)
        stored = cloud
      }
    } catch {
      // Prefer local cache if cloud refresh fails
    }
  }

  if (!stored) return false
  const ok = (await sha256Hex(pin.trim())) === stored
  if (ok) sessionStorage.setItem(UNLOCK_KEY, '1')
  return ok
}

export function clearPin(): void {
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(UNLOCK_KEY)
}
