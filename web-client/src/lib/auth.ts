const AUTH_CHANNEL = 'jadmin-auth'

export function sanitizeRedirect(from: unknown): string | null {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return null
  }
  if (from === '/login' || from.startsWith('/login?')) {
    return null
  }
  return from
}

export function publishAuthLogout(): void {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.postMessage({ type: 'logout' })
  channel.close()
}

export function subscribeAuthLogout(onLogout: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined
  }
  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === 'logout') {
      onLogout()
    }
  }
  return () => channel.close()
}
