import { Modal, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useTheme, radii, spacing, type Palette } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { palette } = useTheme();
  const styles = createStyles(palette);

  function stopPropagation(event: GestureResponderEvent) {
    event.stopPropagation();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={stopPropagation}>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.actions}>
              <PrimaryButton
                label={cancelLabel}
                variant="ghost"
                onPress={onCancel}
                style={styles.actionButton}
              />
              <PrimaryButton
                label={confirmLabel}
                onPress={onConfirm}
                accentColor={destructive ? palette.danger : undefined}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(30, 26, 20, 0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    card: {
      width: 320,
      maxWidth: '100%',
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    message: {
      fontSize: 14,
      color: colors.inkMuted,
      marginBottom: spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
}
