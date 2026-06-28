import { describe, expect, it } from '@jest/globals'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toContain('px-2')
    const omitted = undefined as string | undefined
    expect(cn('px-2', omitted, 'py-1')).toContain('py-1')
  })
})
