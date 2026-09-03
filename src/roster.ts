import type { Student } from './types'

const KEY = 'w2p-roster-v1'

export function loadRoster(): Student[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Student[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s) => s && typeof s.id === 'string' && typeof s.name === 'string',
    )
  } catch {
    return []
  }
}

export function saveRoster(students: Student[]): void {
  localStorage.setItem(KEY, JSON.stringify(students))
}

export function newId(): string {
  return crypto.randomUUID()
}

export const EXAMPLE_STUDENTS: Student[] = [
  {
    id: 'example-1',
    name: 'EXAMPLE: Alex Rivera',
    parentEmail: 'parent.alex.example@example.com',
    notes: 'EXAMPLE data — replace with real roster',
  },
  {
    id: 'example-2',
    name: 'EXAMPLE: Jordan Kim',
    parentEmail: 'parent.jordan.example@example.com',
    notes: 'EXAMPLE data — replace with real roster',
  },
  {
    id: 'example-3',
    name: 'EXAMPLE: Sam Patel',
    parentEmail: 'parent.sam.example@example.com',
    notes: 'EXAMPLE data — replace with real roster',
  },
]
