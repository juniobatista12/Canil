import { QueryClient } from '@tanstack/react-query'

const testClients = new Set<QueryClient>()

export function createTestQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  testClients.add(client)
  return client
}

export function clearTestQueryClients() {
  for (const client of testClients) {
    client.clear()
    client.getQueryCache().clear()
    client.getMutationCache().clear()
  }
  testClients.clear()
}
