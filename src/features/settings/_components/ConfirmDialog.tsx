import { Modal, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ConfirmDialogProps = {
  isVisible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * The gate in front of anything that destroys data.
 *
 * The body says what is deleted and what is kept, in those words, because "are you sure?" tells
 * someone on day 41 nothing about what they are about to lose. Cancel is the second button and
 * the plain one; confirming is a deliberate reach.
 *
 * Both buttons go dead once the action is running. Cancelling cannot call back a write already in
 * flight, and a live Cancel that quietly does nothing is worse than no Cancel at all.
 */
export const ConfirmDialog = ({
  isVisible,
  title,
  body,
  confirmLabel,
  isConfirming,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      accessibilityViewIsModal
      onRequestClose={onCancel}
    >
      <View style={styles.scrim}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              label={confirmLabel}
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              isDisabled={isConfirming}
            />
            <SecondaryButton
              label={t('common.cancel')}
              accessibilityLabel={t('common.cancel')}
              onPress={onCancel}
              isDisabled={isConfirming}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.massive,
    backgroundColor: colors.scrim,
  },
  /**
   * `raised` rather than `card`, with an outline: the scrim dims the page to roughly the card
   * grey, and a dialog painted the same colour as the rows behind it stopped reading as a thing
   * on top of them.
   */
  dialog: {
    width: '100%',
    gap: spacing.xxxl,
    backgroundColor: colors.raised,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingVertical: spacing.massive,
    paddingHorizontal: spacing.giant,
  },
  title: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  body: {
    ...typography.ruleName,
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
  },
});
