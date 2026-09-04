import type { Photo } from './types'

const DB_NAME = 'class-photo-wall'
const DB_VERSION = 1
const STORE = 'photos'

type Row = {
  id: string
  caption: string
  createdAt: string
  path: string
  blob: Blob
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB tx failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB tx aborted'))
  })
}

export async function listLocalPhotos(): Promise<Photo[]> {
  const db = await openDb()
  const rows = await new Promise<Row[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as Row[]) ?? [])
    req.onerror = () => reject(req.error ?? new Error('list failed'))
  })
  db.close()
  return rows
    .map((r) => ({
      id: r.id,
      caption: r.caption,
      createdAt: r.createdAt,
      path: r.path,
      url: URL.createObjectURL(r.blob),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addLocalPhoto(blob: Blob, caption: string): Promise<Photo> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const path = `local/${id}`
  const row: Row = { id, caption, createdAt, path, blob }
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put(row)
  await txDone(tx)
  db.close()
  return { id, caption, createdAt, path, url: URL.createObjectURL(blob) }
}

export async function deleteLocalPhoto(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).delete(id)
  await txDone(tx)
  db.close()
}
