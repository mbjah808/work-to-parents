import type { Photo } from './types'

type RemoteRow = {
  id: string
  caption: string
  created_at: string
  storage_path: string
}

function config() {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  return { url, key }
}

export function supabaseConfigured(): boolean {
  const { url, key } = config()
  return Boolean(url && key)
}

function headers(extra: Record<string, string> = {}): HeadersInit {
  const { key } = config()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  }
}

function publicUrl(path: string): string {
  const { url } = config()
  return `${url}/storage/v1/object/public/class-photos/${path}`
}

export async function fetchCloudPinHash(): Promise<string | null> {
  const { url } = config()
  const res = await fetch(`${url}/rest/v1/wall_config?id=eq.1&select=pin_hash`, {
    headers: headers({ Accept: 'application/json' }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Could not load class PIN (${res.status}): ${text.slice(0, 160)}`)
  }
  const rows = (await res.json()) as { pin_hash: string }[]
  return rows[0]?.pin_hash ?? null
}

export async function saveCloudPinHash(pinHash: string): Promise<void> {
  const { url } = config()
  const res = await fetch(`${url}/rest/v1/wall_config`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify({
      id: 1,
      pin_hash: pinHash,
      updated_at: new Date().toISOString(),
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Could not save class PIN (${res.status}): ${text.slice(0, 160)}`)
  }
}

export async function listCloudPhotos(): Promise<Photo[]> {
  const { url } = config()
  const res = await fetch(
    `${url}/rest/v1/photos?select=id,caption,created_at,storage_path&order=created_at.desc`,
    { headers: headers({ Accept: 'application/json' }) },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Could not load gallery (${res.status}): ${text.slice(0, 160)}`)
  }
  const rows = (await res.json()) as RemoteRow[]
  return rows.map((r) => ({
    id: r.id,
    caption: r.caption ?? '',
    createdAt: r.created_at,
    path: r.storage_path,
    url: publicUrl(r.storage_path),
  }))
}

export async function addCloudPhoto(blob: Blob, caption: string, filename: string): Promise<Photo> {
  const { url } = config()
  const id = crypto.randomUUID()
  const ext = filename.split('.').pop()?.toLowerCase() || (blob.type.includes('png') ? 'png' : 'jpg')
  const storagePath = `${id}.${ext}`
  const contentType = blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

  const up = await fetch(`${url}/storage/v1/object/class-photos/${storagePath}`, {
    method: 'POST',
    headers: headers({
      'Content-Type': contentType,
      'x-upsert': 'false',
    }),
    body: blob,
  })
  if (!up.ok) {
    const text = await up.text()
    throw new Error(`Upload failed (${up.status}): ${text.slice(0, 160)}`)
  }

  const createdAt = new Date().toISOString()
  const ins = await fetch(`${url}/rest/v1/photos`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      id,
      caption,
      storage_path: storagePath,
      created_at: createdAt,
    }),
  })
  if (!ins.ok) {
    const text = await ins.text()
    throw new Error(`Saved file but not metadata (${ins.status}): ${text.slice(0, 160)}`)
  }

  return {
    id,
    caption,
    createdAt,
    path: storagePath,
    url: publicUrl(storagePath),
  }
}

export async function deleteCloudPhoto(id: string, path: string): Promise<void> {
  const { url } = config()
  await fetch(`${url}/storage/v1/object/class-photos`, {
    method: 'DELETE',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: [path] }),
  })
  const del = await fetch(`${url}/rest/v1/photos?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers({ Prefer: 'return=minimal' }),
  })
  if (!del.ok) {
    const text = await del.text()
    throw new Error(`Delete failed (${del.status}): ${text.slice(0, 160)}`)
  }
}
