import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/button'
import { UIText } from '@/components/ui/text'
import { useThemedSurface } from '@/providers/ThemeProvider'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  destructive?: boolean
  loading?: boolean
  confirmDisabled?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onOpenChange,
  destructive,
  loading = false,
  confirmDisabled = false,
  children,
}: ConfirmDialogProps) {
  const insets = useSafeAreaInsets()
  const surface = useThemedSurface('border', 'p-4')

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1" pointerEvents="box-none">
        <Pressable
          style={styles.backdrop}
          onPress={() => onOpenChange(false)}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          bottomOffset={insets.bottom}
        >
          <View
            style={[surface.style, styles.card]}
            className={`${surface.className} border-border w-full max-w-md self-center rounded-lg`}
          >
            <UIText className="mb-2 text-lg font-semibold">{title}</UIText>
            <UIText className="text-muted-foreground mb-4">{description}</UIText>
            {children ? <View className="mb-4 gap-3">{children}</View> : null}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  title={cancelLabel}
                  variant="outline"
                  disabled={loading}
                  onPress={() => onOpenChange(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={confirmLabel}
                  variant={destructive ? 'destructive' : 'default'}
                  disabled={loading || confirmDisabled}
                  onPress={onConfirm}
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    zIndex: 1,
    elevation: 8,
    width: '100%',
    maxWidth: 448,
  },
})
