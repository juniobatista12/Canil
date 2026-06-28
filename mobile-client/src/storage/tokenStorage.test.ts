import * as SecureStore from 'expo-secure-store'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  TOKEN_KEYS,
} from '@/storage/tokenStorage'

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses fixed SecureStore keys', () => {
    expect(TOKEN_KEYS.access).toBe('jadmin_access_token')
    expect(TOKEN_KEYS.refresh).toBe('jadmin_refresh_token')
  })

  it('reads and writes tokens', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('access').mockResolvedValueOnce('refresh')

    await setTokens('new-access', 'new-refresh')

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('jadmin_access_token', 'new-access')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('jadmin_refresh_token', 'new-refresh')

    const access = await getAccessToken()
    const refresh = await getRefreshToken()
    expect(access).toBe('access')
    expect(refresh).toBe('refresh')
  })

  it('clears tokens', async () => {
    await clearTokens()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('jadmin_access_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('jadmin_refresh_token')
  })
})
