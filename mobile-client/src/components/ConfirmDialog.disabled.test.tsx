import { describe, expect, it, jest } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ConfirmDialog disabled', () => {
  it('disables confirm when confirmDisabled', async () => {
    await renderWithProviders(
      <ConfirmDialog
        open
        title="Confirmar"
        description="Desc"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={jest.fn()}
        onOpenChange={jest.fn()}
        confirmDisabled
      />,
    )

    const confirm = screen.getByRole('button', { name: 'Confirmar' })
    expect(confirm.props.accessibilityState?.disabled ?? confirm.props.disabled).toBeTruthy()
  })
})
