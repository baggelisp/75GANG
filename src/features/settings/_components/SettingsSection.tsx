import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/theme/spacing';

export type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <View style={styles.section}>
      <SectionLabel>{title}</SectionLabel>
      <Card>{children}</Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
});
