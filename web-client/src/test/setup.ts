import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

const broadcastChannels: Array<{
  onmessage: ((event: MessageEvent) => void) | null
  close: () => void
}> = []

class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(name: string) {
    void name
    broadcastChannels.push(this)
  }

  postMessage(data: unknown) {
    broadcastChannels.forEach((channel) => {
      channel.onmessage?.({ data } as MessageEvent)
    })
  }

  close() {
    const index = broadcastChannels.indexOf(this)
    if (index >= 0) broadcastChannels.splice(index, 1)
  }
}

vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  while (broadcastChannels.length > 0) {
    broadcastChannels[broadcastChannels.length - 1]?.close()
  }
})
