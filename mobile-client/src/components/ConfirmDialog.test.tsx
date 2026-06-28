import { describe, expect, it, jest } from '@jest/globals'
import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ConfirmDialog confirm', () => {
  it('confirms and cancels', async () => {
    const onConfirm = jest.fn()
    const onOpenChange = jest.fn()

    const user = userEvent.setup()
    await renderWithProviders(
      <ConfirmDialog
        open
        title="Confirmar"
        description="Tem certeza?"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    )

    await user.press(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalled())

    await user.press(screen.getAllByRole('button', { name: 'Cancelar' }).at(-1)!)
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
