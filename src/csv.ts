import type { Student } from './types'
import { newId } from './roster'

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseRosterCsv(text: string): Student[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return []

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const nameIdx = header.findIndex((h) => h === 'name' || h === 'student' || h === 'student_name')
  const emailIdx = header.findIndex(
    (h) => h === 'parent_email' || h === 'email' || h === 'parentemail',
  )
  const notesIdx = header.findIndex((h) => h === 'notes' || h === 'note')

  const hasHeader = nameIdx >= 0
  const start = hasHeader ? 1 : 0
  const nI = hasHeader ? nameIdx : 0
  const eI = hasHeader ? (emailIdx >= 0 ? emailIdx : 1) : 1
  const noI = hasHeader ? notesIdx : 2

  const students: Student[] = []
  for (let i = start; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const name = (cols[nI] ?? '').trim()
    if (!name) continue
    students.push({
      id: newId(),
      name,
      parentEmail: (cols[eI] ?? '').trim(),
      notes: noI >= 0 ? (cols[noI] ?? '').trim() : '',
    })
  }
  return students
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function rosterToCsv(students: Student[]): string {
  const rows = ['name,parent_email,notes']
  for (const s of students) {
    rows.push([csvEscape(s.name), csvEscape(s.parentEmail), csvEscape(s.notes)].join(','))
  }
  return rows.join('\n') + '\n'
}
