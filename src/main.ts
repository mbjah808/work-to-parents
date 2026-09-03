import './style.css'
import { registerSW } from 'virtual:pwa-register'
import type { Capture, Screen, Student } from './types'
import { EXAMPLE_STUDENTS, loadRoster, newId, saveRoster } from './roster'
import { parseRosterCsv, rosterToCsv } from './csv'
import {
  googleConfigured,
  isSignedIn,
  sendWorkEmail,
  signedInEmail,
  signIn,
  signOut,
} from './gmail'
import { canWebShareFiles, downloadPhoto, sharePhoto } from './share'

registerSW({ immediate: true })

type State = {
  screen: Screen
  roster: Student[]
  capture: Capture | null
  selected: Student | null
  query: string
  toast: string
  busy: boolean
  error: string
}

const state: State = {
  screen: 'capture',
  roster: loadRoster(),
  capture: null,
  selected: null,
  query: '',
  toast: '',
  busy: false,
  error: '',
}

function discardCapture(): void {
  if (state.capture) {
    URL.revokeObjectURL(state.capture.url)
    state.capture = null
  }
  state.selected = null
}

function readyNext(): void {
  discardCapture()
  state.screen = 'capture'
  state.error = ''
  state.busy = false
  render()
  queueMicrotask(() => document.getElementById('file-input')?.click())
}

function toast(msg: string): void {
  state.toast = msg
  render()
  window.setTimeout(() => {
    if (state.toast === msg) {
      state.toast = ''
      render()
    }
  }, 2800)
}

function filenameFor(student: Student): string {
  const safe = student.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'work'
  const d = new Date()
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ext = state.capture?.blob.type === 'image/png' ? 'png' : 'jpg'
  return `${safe}-${stamp}.${ext}`
}

function onPhotoFile(file: File): void {
  discardCapture()
  const url = URL.createObjectURL(file)
  state.capture = { blob: file, url, filename: file.name || 'work.jpg' }
  state.screen = 'pick'
  state.query = ''
  state.error = ''
  render()
}

async function doSendGmail(): Promise<void> {
  if (!state.capture || !state.selected) return
  const student = state.selected
  const photo = state.capture.blob
  const name = filenameFor(student)
  if (!student.parentEmail) {
    state.error = 'This student has no parent email. Add one in the roster, or use Share / Download.'
    render()
    return
  }
  state.busy = true
  state.error = ''
  render()
  try {
    await sendWorkEmail({
      to: student.parentEmail,
      studentName: student.name,
      photo,
      filename: name,
    })
    toast(`Sent to ${student.parentEmail}`)
    readyNext()
  } catch (e) {
    state.busy = false
    state.error = e instanceof Error ? e.message : 'Send failed'
    render()
  }
}

async function doShare(): Promise<void> {
  if (!state.capture || !state.selected) return
  state.busy = true
  state.error = ''
  render()
  try {
    const ok = await sharePhoto({
      blob: state.capture.blob,
      filename: filenameFor(state.selected),
      studentName: state.selected.name,
      parentEmail: state.selected.parentEmail,
    })
    if (!ok) {
      downloadPhoto(state.capture.blob, filenameFor(state.selected))
      toast('Photo saved — attach it in Mail')
    } else {
      toast('Opened share sheet')
    }
    readyNext()
  } catch (e) {
    state.busy = false
    const name = e instanceof Error ? e.name : ''
    if (name === 'AbortError') {
      state.error = ''
      render()
      return
    }
    state.error = e instanceof Error ? e.message : 'Share failed'
    render()
  }
}

function doDownload(): void {
  if (!state.capture || !state.selected) return
  downloadPhoto(state.capture.blob, filenameFor(state.selected))
  toast('Photo downloaded — attach it in Mail (mailto cannot attach files on iOS)')
  readyNext()
}

function filteredRoster(): Student[] {
  const q = state.query.trim().toLowerCase()
  const list = [...state.roster].sort((a, b) => a.name.localeCompare(b.name))
  if (!q) return list
  return list.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.parentEmail.toLowerCase().includes(q) ||
      s.notes.toLowerCase().includes(q),
  )
}

function persist(): void {
  saveRoster(state.roster)
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue
    if (k === 'class') node.className = String(v)
    else if (k.startsWith('on')) continue
    else if (v === true) node.setAttribute(k, '')
    else node.setAttribute(k, v)
  }
  for (const c of children) node.append(c)
  return node
}

function header(title: string, back?: () => void): HTMLElement {
  const bar = el('header', { class: 'topbar' })
  if (back) {
    const b = el('button', { class: 'icon-btn', type: 'button' }, 'Back')
    b.addEventListener('click', back)
    bar.append(b)
  } else {
    bar.append(el('div', { class: 'icon-btn ghost' }, 'Work'))
  }
  bar.append(el('h1', {}, title))
  const rosterBtn = el('button', { class: 'icon-btn', type: 'button' }, 'Roster')
  rosterBtn.addEventListener('click', () => {
    state.screen = 'roster'
    state.error = ''
    render()
  })
  bar.append(rosterBtn)
  return bar
}

function googleBar(): HTMLElement {
  const wrap = el('div', { class: 'google-bar' })
  if (!googleConfigured()) {
    wrap.append(
      el(
        'p',
        { class: 'hint' },
        'Google sign-in is not configured yet. Use Share or Download on iPad. See README to add VITE_GOOGLE_CLIENT_ID.',
      ),
    )
    return wrap
  }
  if (isSignedIn()) {
    const email = signedInEmail() || 'Google account'
    wrap.append(el('span', {}, `Signed in: ${email}`))
    const out = el('button', { class: 'linkish', type: 'button' }, 'Sign out')
    out.addEventListener('click', () => {
      signOut()
      render()
    })
    wrap.append(out)
  } else {
    const inn = el('button', { class: 'btn btn-google', type: 'button' }, 'Sign in with Google')
    inn.addEventListener('click', () => {
      void (async () => {
        try {
          await signIn()
          toast('Signed in with Google')
          render()
        } catch (e) {
          state.error = e instanceof Error ? e.message : 'Sign-in failed'
          render()
        }
      })()
    })
    wrap.append(inn)
  }
  return wrap
}

function renderCapture(): HTMLElement {
  const main = el('div', { class: 'screen' })
  main.append(header('Capture work'))
  const body = el('div', { class: 'body' })
  body.append(
    el(
      'p',
      { class: 'lead' },
      'Photograph a paper, tap the student, confirm, send. Photo is discarded after send — not stored.',
    ),
  )
  body.append(googleBar())

  const input = el('input', {
    id: 'file-input',
    class: 'sr-only',
    type: 'file',
    accept: 'image/*',
    capture: 'environment',
  }) as HTMLInputElement
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    input.value = ''
    if (file) onPhotoFile(file)
  })

  const take = el('button', { class: 'btn btn-primary btn-xl', type: 'button' }, 'Take photo')
  take.addEventListener('click', () => input.click())
  body.append(input, take)

  const pickLib = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Choose from Photos')
  const lib = el('input', {
    class: 'sr-only',
    type: 'file',
    accept: 'image/*',
  }) as HTMLInputElement
  lib.addEventListener('change', () => {
    const file = lib.files?.[0]
    lib.value = ''
    if (file) onPhotoFile(file)
  })
  pickLib.addEventListener('click', () => lib.click())
  body.append(lib, pickLib)

  if (state.roster.length === 0) {
    body.append(
      el(
        'div',
        { class: 'empty' },
        el('strong', {}, 'No students yet'),
        el(
          'p',
          {},
          'Import a CSV with columns name, parent_email, notes — or add students in Roster. Example rows must be labeled EXAMPLE if you use sample data.',
        ),
      ),
    )
  } else {
    body.append(el('p', { class: 'muted' }, `${state.roster.length} students on this iPad`))
  }

  if (state.error) body.append(el('p', { class: 'error' }, state.error))
  main.append(body)
  return main
}

function renderPick(): HTMLElement {
  const main = el('div', { class: 'screen' })
  main.append(
    header('Who is this?', () => {
      discardCapture()
      state.screen = 'capture'
      render()
    }),
  )
  const body = el('div', { class: 'body' })
  if (state.capture) {
    body.append(el('img', { class: 'thumb', src: state.capture.url, alt: 'Captured student work' }))
  }
  const search = el('input', {
    class: 'search',
    type: 'search',
    placeholder: 'Search student…',
    value: state.query,
    autocomplete: 'off',
    enterkeyhint: 'search',
  }) as HTMLInputElement
  search.addEventListener('input', () => {
    state.query = search.value
    renderList()
  })
  body.append(search)
  const list = el('div', { class: 'list' })
  function renderList() {
    list.replaceChildren()
    const items = filteredRoster()
    if (state.roster.length === 0) {
      list.append(
        el(
          'div',
          { class: 'empty' },
          el('strong', {}, 'Roster is empty'),
          el('p', {}, 'Open Roster and import a CSV (name, parent_email, notes).'),
        ),
      )
      return
    }
    if (items.length === 0) {
      list.append(el('p', { class: 'muted' }, 'No matches'))
      return
    }
    for (const s of items) {
      const row = el('button', { class: 'student-row', type: 'button' })
      row.append(el('span', { class: 'student-name' }, s.name))
      row.append(el('span', { class: 'student-meta' }, s.parentEmail || 'No parent email'))
      if (s.notes) row.append(el('span', { class: 'student-notes' }, s.notes))
      row.addEventListener('click', () => {
        state.selected = s
        state.screen = 'confirm'
        state.error = ''
        render()
      })
      list.append(row)
    }
  }
  renderList()
  body.append(list)
  main.append(body)
  queueMicrotask(() => search.focus())
  return main
}

function renderConfirm(): HTMLElement {
  const main = el('div', { class: 'screen' })
  main.append(
    header('Confirm send', () => {
      state.screen = 'pick'
      state.selected = null
      state.error = ''
      render()
    }),
  )
  const body = el('div', { class: 'body' })
  const s = state.selected
  if (state.capture) {
    body.append(el('img', { class: 'thumb large', src: state.capture.url, alt: 'Work to send' }))
  }
  if (s) {
    body.append(el('h2', { class: 'confirm-name' }, s.name))
    body.append(el('p', { class: 'confirm-email' }, s.parentEmail || 'No parent email on file'))
    if (s.notes) body.append(el('p', { class: 'muted' }, s.notes))
  }
  if (state.error) body.append(el('p', { class: 'error' }, state.error))

  const signed = isSignedIn() && googleConfigured()
  if (signed) {
    const send = el(
      'button',
      { class: 'btn btn-primary btn-xl', type: 'button' },
      state.busy ? 'Sending…' : 'Send via Gmail',
    )
    send.toggleAttribute('disabled', state.busy || !s?.parentEmail)
    send.addEventListener('click', () => void doSendGmail())
    body.append(send)
  } else {
    body.append(
      el(
        'p',
        { class: 'hint' },
        signed
          ? ''
          : 'Not using Gmail yet. iOS cannot attach files with a mail link — use Share (opens Mail) or Download.',
      ),
    )
  }

  const share = el(
    'button',
    { class: 'btn btn-secondary btn-xl', type: 'button' },
    canWebShareFiles() ? 'Share / Mail from iPad' : 'Share sheet',
  )
  share.toggleAttribute('disabled', state.busy)
  share.addEventListener('click', () => void doShare())
  body.append(share)

  const dl = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Download photo')
  dl.toggleAttribute('disabled', state.busy)
  dl.addEventListener('click', doDownload)
  body.append(dl)

  const retake = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Retake photo')
  retake.addEventListener('click', () => {
    discardCapture()
    state.screen = 'capture'
    render()
  })
  body.append(retake)
  main.append(body)
  return main
}

function renderRoster(): HTMLElement {
  const main = el('div', { class: 'screen' })
  main.append(
    header('Roster', () => {
      state.screen = state.capture ? 'pick' : 'capture'
      render()
    }),
  )
  const body = el('div', { class: 'body' })
  body.append(googleBar())
  body.append(
    el(
      'p',
      { class: 'hint' },
      'Names and parent emails stay on this iPad (localStorage). Photos are never saved here.',
    ),
  )

  const form = el('form', { class: 'add-form' })
  const nameIn = el('input', {
    name: 'name',
    required: '',
    placeholder: 'Student name',
    autocomplete: 'off',
  }) as HTMLInputElement
  const emailIn = el('input', {
    name: 'email',
    type: 'email',
    placeholder: 'Parent email',
    autocomplete: 'off',
    inputmode: 'email',
  }) as HTMLInputElement
  const notesIn = el('input', {
    name: 'notes',
    placeholder: 'Notes (optional)',
    autocomplete: 'off',
  }) as HTMLInputElement
  const addBtn = el('button', { class: 'btn btn-primary', type: 'submit' }, 'Add student')
  form.append(nameIn, emailIn, notesIn, addBtn)
  form.addEventListener('submit', (ev) => {
    ev.preventDefault()
    const name = nameIn.value.trim()
    if (!name) return
    state.roster.push({
      id: newId(),
      name,
      parentEmail: emailIn.value.trim(),
      notes: notesIn.value.trim(),
    })
    persist()
    nameIn.value = ''
    emailIn.value = ''
    notesIn.value = ''
    render()
  })
  body.append(form)

  const tools = el('div', { class: 'row-btns' })
  const csvIn = el('input', {
    class: 'sr-only',
    type: 'file',
    accept: '.csv,text/csv',
  }) as HTMLInputElement
  csvIn.addEventListener('change', () => {
    const file = csvIn.files?.[0]
    csvIn.value = ''
    if (!file) return
    void file.text().then((text) => {
      const imported = parseRosterCsv(text)
      if (imported.length === 0) {
        state.error = 'No rows found. Need columns name, parent_email, notes.'
        render()
        return
      }
      state.roster = [...state.roster, ...imported]
      persist()
      toast(`Imported ${imported.length} students`)
      render()
    })
  })
  const imp = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Import CSV')
  imp.addEventListener('click', () => csvIn.click())
  const exp = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Export CSV')
  exp.addEventListener('click', () => {
    const blob = new Blob([rosterToCsv(state.roster)], { type: 'text/csv;charset=utf-8' })
    downloadPhoto(blob, 'roster.csv')
  })
  tools.append(csvIn, imp, exp)
  body.append(tools)

  if (state.roster.length === 0) {
    body.append(
      el(
        'div',
        { class: 'empty' },
        el('strong', {}, 'Empty roster'),
        el(
          'p',
          {},
          'Import CSV with header: name,parent_email,notes — one student per row. Sample/demo names must include the word EXAMPLE.',
        ),
      ),
    )
    const demo = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Load EXAMPLE students')
    demo.addEventListener('click', () => {
      state.roster = EXAMPLE_STUDENTS.map((s) => ({ ...s, id: newId() }))
      persist()
      toast('Loaded EXAMPLE students only — not real kids')
      render()
    })
    body.append(demo)
  } else {
    const list = el('div', { class: 'list' })
    for (const s of [...state.roster].sort((a, b) => a.name.localeCompare(b.name))) {
      const row = el('div', { class: 'student-row static' })
      row.append(el('span', { class: 'student-name' }, s.name))
      row.append(el('span', { class: 'student-meta' }, s.parentEmail || 'No parent email'))
      if (s.notes) row.append(el('span', { class: 'student-notes' }, s.notes))
      const del = el('button', { class: 'btn-tiny', type: 'button' }, 'Remove')
      del.addEventListener('click', () => {
        state.roster = state.roster.filter((x) => x.id !== s.id)
        persist()
        render()
      })
      row.append(del)
      list.append(row)
    }
    body.append(list)
    const clear = el('button', { class: 'btn btn-ghost danger', type: 'button' }, 'Clear roster')
    clear.addEventListener('click', () => {
      if (!confirm('Remove all students from this iPad?')) return
      state.roster = []
      persist()
      render()
    })
    body.append(clear)
  }

  if (state.error) body.append(el('p', { class: 'error' }, state.error))
  main.append(body)
  return main
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) return
  app.replaceChildren()
  let screen: HTMLElement
  if (state.screen === 'pick') screen = renderPick()
  else if (state.screen === 'confirm') screen = renderConfirm()
  else if (state.screen === 'roster') screen = renderRoster()
  else screen = renderCapture()
  app.append(screen)
  if (state.toast) {
    app.append(el('div', { class: 'toast', role: 'status' }, state.toast))
  }
}

render()
