import type { Photo, StorageMode } from './types'
import { addLocalPhoto, deleteLocalPhoto, listLocalPhotos } from './local-store'
import {
  addCloudPhoto,
  deleteCloudPhoto,
  listCloudPhotos,
  supabaseConfigured,
} from './supabase-store'

export function getStorageMode(): StorageMode {
  return supabaseConfigured() ? 'supabase' : 'local'
}

export async function listPhotos(): Promise<Photo[]> {
  return getStorageMode() === 'supabase' ? listCloudPhotos() : listLocalPhotos()
}

export async function uploadPhoto(blob: Blob, caption: string, filename: string): Promise<Photo> {
  if (getStorageMode() === 'supabase') return addCloudPhoto(blob, caption, filename)
  return addLocalPhoto(blob, caption)
}

export async function removePhoto(photo: Photo): Promise<void> {
  if (getStorageMode() === 'supabase') return deleteCloudPhoto(photo.id, photo.path)
  return deleteLocalPhoto(photo.id)
}
