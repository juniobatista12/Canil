import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ConfirmDialog', () => {
  it('calls onConfirm and closes on cancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Confirmar"
        description="Tem certeza?"
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
