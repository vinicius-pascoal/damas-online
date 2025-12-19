let cachedNickname: string | null = null

const KEY = 'damas_player_nickname'

export function getNickname(): string | null {
  if (cachedNickname) return cachedNickname
  if (typeof window === 'undefined') return null

  try {
    const existing = localStorage.getItem(KEY)
    if (existing) {
      cachedNickname = existing
      return existing
    }
  } catch { }

  return null
}

export function setNickname(nickname: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(KEY, nickname)
    cachedNickname = nickname
  } catch {
    console.error('Erro ao salvar nickname no localStorage')
  }
}

export function clearNickname(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(KEY)
    cachedNickname = null
  } catch { }
}
