let cachedClientId: string | null = null

export function getClientId(): string | null {
  if (cachedClientId) return cachedClientId
  if (typeof window === 'undefined') return null

  const KEY = 'damas_client_id'
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) {
      cachedClientId = existing
      return existing
    }
  } catch { }

  // Gera um ID estável para o cliente
  const newId = (window.crypto && 'randomUUID' in window.crypto)
    ? window.crypto.randomUUID()
    : `client_${Math.random().toString(36).slice(2)}_${Date.now()}`

  try {
    localStorage.setItem(KEY, newId)
  } catch { }
  cachedClientId = newId
  return newId
}
