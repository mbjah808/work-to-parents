import './style.css'
import { registerSW } from 'virtual:pwa-register'
import type { Photo, PhotoDraft, Screen } from './types'
import { hasPin, isUnlocked, lockSession, setPin, verifyPin } from './pin'
import { getStorageMode, listPhotos, removePhoto, uploadPhoto } from './storage'

registerSW({ immediate: true })

type State = {
  screen: Screen
  photos: Photo[]
  draft: PhotoDraft | null
  caption: string
  pinInput: string
  pinConfirm: string
  toast: string
  busy: boolean
  error: string
  lightbox: Photo | null
  loadingGallery: boolean
}

const state: State = {
  screen: !hasPin() ? 'setup' : isUnlocked() ? 'gallery' : 'unlock',
  photos: [],
  draft: null,
  caption: '',
  pinInput: '',
  pinConfirm: '',
  toast: '',
  busy: false,
  error: '',
  lightbox: null,
  loadingGallery: false,
}

function toast(msg: string): void {
  state.toast = msg
  render()
  window.setTimeout(() => {
    if (state.toast === msg) {
      state.toast = ''
      render()
    }
  }, 2600)
}

function discardDraft(): void {
  if (state.draft) {
    URL.revokeObjectURL(state.draft.url)
    state.draft = null
  }
  state.caption = ''
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

async function refreshGallery(): Promise<void> {
  state.loadingGallery = true
  state.error = ''
  render()
  try {
    // Revoke prior local blob URLs
    for (const p of state.photos) {
      if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
    }
    state.photos = await listPhotos()
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Could not load photos'
  } finally {
    state.loadingGallery = false
    render()
  }
}

function go(screen: Screen): void {
  state.screen = screen
  state.error = ''
  render()
  if (screen === 'gallery') void refreshGallery()
}

function onPhotoFile(file: File): void {
  discardDraft()
  state.draft = {
    blob: file,
    url: URL.createObjectURL(file),
    filename: file.name || `photo-${Date.now()}.jpg`,
  }
  state.caption = ''
  state.screen = 'review'
  state.error = ''
  render()
}

async function doUpload(skipCaption = false): Promise<void> {
  if (!state.draft || state.busy) return
  state.busy = true
  state.error = ''
  render()
  try {
    const caption = skipCaption ? '' : state.caption.trim()
    await uploadPhoto(state.draft.blob, caption, state.draft.filename)
    discardDraft()
    toast('Photo added to the wall')
    go('gallery')
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Upload failed'
    state.busy = false
    render()
    return
  }
  state.busy = false
}

async function doDelete(photo: Photo): Promise<void> {
  if (state.busy) return
  if (!window.confirm('Remove this photo from the class wall?')) return
  state.busy = true
  state.error = ''
  render()
  try {
    await removePhoto(photo)
    if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url)
    state.photos = state.photos.filter((p) => p.id !== photo.id)
    if (state.lightbox?.id === photo.id) state.lightbox = null
    toast('Photo removed')
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Delete failed'
  } finally {
    state.busy = false
    render()
  }
}

function topbar(title: string, left: string, right: string): string {
  return `<header class="topbar">
    <div class="topbar-slot left">${left}</div>
    <h1>${escapeHtml(title)}</h1>
    <div class="topbar-slot right">${right}</div>
  </header>`
}

function renderUnlock(): string {
  return `<div class="screen gate">
    ${topbar('Class Photo Wall', '', '')}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="eyebrow">Parents &amp; teachers</p>
        <h2>Enter class PIN</h2>
        <p class="muted">Same PIN for viewing the wall and uploading photos.</p>
        <form id="pin-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="Class PIN" maxlength="32" value="${escapeHtml(state.pinInput)}" />
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ''}
          <button class="btn primary big" type="submit" ${state.busy ? 'disabled' : ''}>Unlock</button>
        </form>
      </div>
    </div>
  </div>`
}

function renderSetup(): string {
  return `<div class="screen gate">
    ${topbar('Class Photo Wall', '', '')}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="eyebrow">Teacher setup</p>
        <h2>Create a class PIN</h2>
        <p class="muted">Parents will use this PIN to open the shared gallery. Store it somewhere safe for your class.</p>
        <form id="setup-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="New PIN (4+ chars)" maxlength="32" value="${escapeHtml(state.pinInput)}" />
          <input id="pin-confirm" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Confirm PIN" maxlength="32" value="${escapeHtml(state.pinConfirm)}" />
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ''}
          <button class="btn primary big" type="submit" ${state.busy ? 'disabled' : ''}>Save PIN &amp; open wall</button>
        </form>
      </div>
    </div>
  </div>`
}

function renderGallery(): string {
  const mode = getStorageMode()
  const tiles = state.photos
    .map(
      (p) => `<button type="button" class="tile" data-id="${escapeHtml(p.id)}" aria-label="Open photo">
        <img src="${escapeHtml(p.url)}" alt="" loading="lazy" />
        ${p.caption ? `<span class="tile-cap">${escapeHtml(p.caption)}</span>` : ''}
      </button>`,
    )
    .join('')

  const empty = !state.loadingGallery && state.photos.length === 0
    ? `<div class="empty-wall">
        <div class="empty-art" aria-hidden="true">📷</div>
        <h2>Your class photo wall</h2>
        <p class="muted">Tap <strong>Take photo</strong> to add the first snapshot. Parents open this same link and enter the class PIN.</p>
      </div>`
    : ''

  return `<div class="screen">
    ${topbar(
      'Class Photo Wall',
      `<button type="button" class="icon-btn ghost" id="btn-settings">Settings</button>`,
      `<button type="button" class="icon-btn ghost" id="btn-lock">Lock</button>`,
    )}
    <div class="body gallery-body">
      <div class="mode-chip ${mode}">${mode === 'supabase' ? 'Cloud gallery' : 'Demo mode (this device)'}</div>
      ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ''}
      ${state.loadingGallery ? `<p class="muted center">Loading wall…</p>` : ''}
      ${empty}
      <div class="masonry">${tiles}</div>
    </div>
    <div class="fab-bar">
      <button type="button" class="btn primary big fab" id="btn-capture">Take photo</button>
    </div>
    ${state.lightbox ? renderLightbox(state.lightbox) : ''}
  </div>`
}

function renderLightbox(photo: Photo): string {
  return `<div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
    <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close">×</button>
    <img src="${escapeHtml(photo.url)}" alt="" />
    <div class="lightbox-meta">
      <p class="lightbox-cap">${photo.caption ? escapeHtml(photo.caption) : '<span class="muted">No caption</span>'}</p>
      <p class="muted">${escapeHtml(formatWhen(photo.createdAt))}</p>
      <button type="button" class="btn danger" id="lightbox-delete" ${state.busy ? 'disabled' : ''}>Remove photo</button>
    </div>
  </div>`
}

function renderCapture(): string {
  return `<div class="screen">
    ${topbar(
      'Take a photo',
      `<button type="button" class="icon-btn ghost" id="btn-back-gallery">Back</button>`,
      '',
    )}
    <div class="body capture-body">
      <p class="lead">Snap classroom moments for the shared wall. Parents see them after you upload.</p>
      <label class="btn primary big file-btn">
        Take photo
        <input id="file-camera" type="file" accept="image/*" capture="environment" hidden />
      </label>
      <label class="btn secondary big file-btn">
        Choose from Photos
        <input id="file-library" type="file" accept="image/*" hidden />
      </label>
      <p class="hint">Uses the rear camera on iPad when available.</p>
    </div>
  </div>`
}

function renderReview(): string {
  if (!state.draft) return renderCapture()
  return `<div class="screen">
    ${topbar(
      'Add to wall',
      `<button type="button" class="icon-btn ghost" id="btn-retake">Retake</button>`,
      '',
    )}
    <div class="body review-body">
      <div class="preview-wrap">
        <img class="preview" src="${escapeHtml(state.draft.url)}" alt="Preview" />
      </div>
      <label class="field">
        <span>Caption <span class="optional">(optional)</span></span>
        <input id="caption-input" type="text" maxlength="120" placeholder="e.g. Science fair builds" value="${escapeHtml(state.caption)}" />
      </label>
      ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ''}
      <button type="button" class="btn primary big" id="btn-upload" ${state.busy ? 'disabled' : ''}>
        ${state.busy ? 'Uploading…' : 'Upload'}
      </button>
      <button type="button" class="btn secondary" id="btn-upload-fast" ${state.busy ? 'disabled' : ''}>
        Upload without caption
      </button>
    </div>
  </div>`
}

function renderSettings(): string {
  const mode = getStorageMode()
  const link = `${location.origin}${import.meta.env.BASE_URL}`
  return `<div class="screen">
    ${topbar(
      'Settings',
      `<button type="button" class="icon-btn ghost" id="btn-back-gallery">Back</button>`,
      '',
    )}
    <div class="body">
      <section class="card">
        <h2>Share with parents</h2>
        <p class="muted">Send this link. They enter the class PIN to view the wall.</p>
        <p class="share-link">${escapeHtml(link)}</p>
        <button type="button" class="btn secondary" id="btn-copy-link">Copy gallery link</button>
      </section>
      <section class="card">
        <h2>Class PIN</h2>
        <p class="muted">One PIN unlocks viewing and uploading on this browser.</p>
        <form id="change-pin-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="New PIN" maxlength="32" />
          <input id="pin-confirm" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Confirm new PIN" maxlength="32" />
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ''}
          <button class="btn secondary" type="submit">Update PIN</button>
        </form>
      </section>
      <section class="card">
        <h2>Storage</h2>
        <p><strong>${mode === 'supabase' ? 'Supabase cloud' : 'Local demo (IndexedDB)'}</strong></p>
        <p class="muted">${
          mode === 'supabase'
            ? 'Photos sync for parents on other devices.'
            : 'Photos stay on this iPad only. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild, for a shared cloud gallery. See README.'
        }</p>
      </section>
      <section class="card">
        <h2>Privacy note</h2>
        <p class="muted">Classroom-trust security: the PIN is a soft gate in the app. It is not bank-grade auth. Share the link and PIN only with your class families.</p>
      </section>
    </div>
  </div>`
}

function render(): void {
  const app = document.getElementById('app')
  if (!app) return
  let html = ''
  switch (state.screen) {
    case 'unlock':
      html = renderUnlock()
      break
    case 'setup':
      html = renderSetup()
      break
    case 'gallery':
      html = renderGallery()
      break
    case 'capture':
      html = renderCapture()
      break
    case 'review':
      html = renderReview()
      break
    case 'settings':
      html = renderSettings()
      break
  }
  if (state.toast) {
    html += `<div class="toast" role="status">${escapeHtml(state.toast)}</div>`
  }
  app.innerHTML = html
  bind()
}

function bind(): void {
  const pinForm = document.getElementById('pin-form') as HTMLFormElement | null
  pinForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = document.getElementById('pin-input') as HTMLInputElement
    state.pinInput = input.value
    state.busy = true
    state.error = ''
    render()
    const ok = await verifyPin(state.pinInput)
    state.busy = false
    if (!ok) {
      state.error = 'Incorrect PIN'
      render()
      return
    }
    state.pinInput = ''
    go('gallery')
  })

  const setupForm = document.getElementById('setup-form') as HTMLFormElement | null
  setupForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const a = (document.getElementById('pin-input') as HTMLInputElement).value
    const b = (document.getElementById('pin-confirm') as HTMLInputElement).value
    state.pinInput = a
    state.pinConfirm = b
    if (a.trim().length < 4) {
      state.error = 'PIN must be at least 4 characters'
      render()
      return
    }
    if (a !== b) {
      state.error = 'PINs do not match'
      render()
      return
    }
    state.busy = true
    render()
    try {
      await setPin(a)
      state.pinInput = ''
      state.pinConfirm = ''
      go('gallery')
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Could not save PIN'
      render()
    } finally {
      state.busy = false
    }
  })

  const changePin = document.getElementById('change-pin-form') as HTMLFormElement | null
  changePin?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const a = (document.getElementById('pin-input') as HTMLInputElement).value
    const b = (document.getElementById('pin-confirm') as HTMLInputElement).value
    if (a.trim().length < 4) {
      state.error = 'PIN must be at least 4 characters'
      render()
      return
    }
    if (a !== b) {
      state.error = 'PINs do not match'
      render()
      return
    }
    try {
      await setPin(a)
      state.error = ''
      toast('PIN updated')
      render()
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Could not update PIN'
      render()
    }
  })

  document.getElementById('btn-settings')?.addEventListener('click', () => go('settings'))
  document.getElementById('btn-lock')?.addEventListener('click', () => {
    lockSession()
    state.pinInput = ''
    go('unlock')
  })
  document.getElementById('btn-capture')?.addEventListener('click', () => go('capture'))
  document.getElementById('btn-back-gallery')?.addEventListener('click', () => go('gallery'))
  document.getElementById('btn-retake')?.addEventListener('click', () => {
    discardDraft()
    go('capture')
  })

  const cam = document.getElementById('file-camera') as HTMLInputElement | null
  cam?.addEventListener('change', () => {
    const f = cam.files?.[0]
    if (f) onPhotoFile(f)
    cam.value = ''
  })
  const lib = document.getElementById('file-library') as HTMLInputElement | null
  lib?.addEventListener('change', () => {
    const f = lib.files?.[0]
    if (f) onPhotoFile(f)
    lib.value = ''
  })

  const caption = document.getElementById('caption-input') as HTMLInputElement | null
  caption?.addEventListener('input', () => {
    state.caption = caption.value
  })

  document.getElementById('btn-upload')?.addEventListener('click', () => void doUpload(false))
  document.getElementById('btn-upload-fast')?.addEventListener('click', () => void doUpload(true))

  document.querySelectorAll('.tile').forEach((el) => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id
      const photo = state.photos.find((p) => p.id === id) ?? null
      state.lightbox = photo
      render()
    })
  })

  document.getElementById('lightbox-close')?.addEventListener('click', () => {
    state.lightbox = null
    render()
  })
  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      state.lightbox = null
      render()
    }
  })
  document.getElementById('lightbox-delete')?.addEventListener('click', () => {
    if (state.lightbox) void doDelete(state.lightbox)
  })

  document.getElementById('btn-copy-link')?.addEventListener('click', async () => {
    const link = `${location.origin}${import.meta.env.BASE_URL}`
    try {
      await navigator.clipboard.writeText(link)
      toast('Link copied')
    } catch {
      window.prompt('Copy this gallery link:', link)
    }
  })
}

render()
if (state.screen === 'gallery') void refreshGallery()
