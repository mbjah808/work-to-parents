export function canWebShareFiles(): boolean {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (!nav.share || typeof nav.canShare !== 'function') return false
  try {
    const file = new File(['x'], 't.jpg', { type: 'image/jpeg' })
    return nav.canShare({ files: [file] })
  } catch {
    return false
  }
}

export async function sharePhoto(opts: {
  blob: Blob
  filename: string
  studentName: string
  parentEmail: string
}): Promise<boolean> {
  const file = new File([opts.blob], opts.filename, { type: opts.blob.type || 'image/jpeg' })
  const text = `Classroom work from ${opts.studentName}\nParent: ${opts.parentEmail}`
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (nav.share) {
    const dataWithFiles: ShareData = {
      title: `${opts.studentName} — classroom work`,
      text,
      files: [file],
    }
    if (!nav.canShare || nav.canShare(dataWithFiles)) {
      await nav.share(dataWithFiles)
      return true
    }
    await nav.share({ title: dataWithFiles.title, text })
    return true
  }
  return false
}

export function downloadPhoto(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
