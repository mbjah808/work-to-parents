export type Student = {
  id: string
  name: string
  parentEmail: string
  notes: string
}

export type Capture = {
  blob: Blob
  url: string
  filename: string
}

export type Screen = 'capture' | 'pick' | 'confirm' | 'roster'
