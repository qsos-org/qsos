export function useDraft<T>(key: string) {
  if (!import.meta.client) return { save: () => {}, load: () => null, clear: () => {} }

  const storageKey = `qsos_draft_${key}`

  const save = (data: T): void => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }

  const load = (): T | null => {
    const stored = localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as T) : null
  }

  const clear = (): void => {
    localStorage.removeItem(storageKey)
  }

  return { save, load, clear }
}
