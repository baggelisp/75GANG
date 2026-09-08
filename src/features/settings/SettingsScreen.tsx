import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { ChallengeMode, ChallengeModeEnum } from '@/domain/modes';
import { useProfile } from '@/features/profile/_hooks/useProfile';
import { ReminderSyncEnum } from '@/features/shared/syncReminders';
import { useReminderSync } from '@/features/shared/useReminderSync';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';

import { AppearanceSection } from './_components/AppearanceSection';
import { ChallengeConfirmDialog } from './_components/ChallengeConfirmDialog';
import { CreditsSection } from './_components/CreditsSection';
import { DataSection } from './_components/DataSection';
import { ImportConfirmDialog } from './_components/ImportConfirmDialog';
import { NameField } from './_components/NameField';
import { RemindersSection } from './_components/RemindersSection';
import { SettingsHeader } from './_components/SettingsHeader';
import { SettingsLoading } from './_components/SettingsLoading';
import { SettingsNote } from './_components/SettingsNote';
import { SettingsSection } from './_components/SettingsSection';
import { SettingsUnavailable } from './_components/SettingsUnavailable';
import { StartAgainSection } from './_components/StartAgainSection';
import { TransferNote } from './_components/TransferNote';
import { ChallengeOutcomeEnum, useChallengeControls } from './_hooks/useChallengeControls';
import { useDataTransfer } from './_hooks/useDataTransfer';
import { useProfileName } from './_hooks/useProfileName';
import { SettingsStatusEnum, useSettings } from './_hooks/useSettings';

/** Everything the user can change, and the two ways to start the challenge over. */
export const SettingsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfile();
  const settings = useSettings();
  const name = useProfileName();
  const controls = useChallengeControls(resolveMode(profile.mode));
  const transfer = useDataTransfer();
  const reminders = useReminderSync();
  const [didActionFail, setDidActionFail] = useState(false);

  const goBack = () => router.back();

  const saveName = () => {
    void name.save();
  };

  const toggleNotifications = async () => {
    await settings.toggleNotifications();
    await reminders.sync();
  };

  const runToggleNotifications = () => {
    void toggleNotifications();
  };

  const stepReminder = async (
    reminder: Parameters<typeof settings.stepReminder>[0],
    steps: number,
  ) => {
    await settings.stepReminder(reminder, steps);
    await reminders.sync();
  };

  const runStepReminder = (
    reminder: Parameters<typeof settings.stepReminder>[0],
    steps: number,
  ) => {
    void stepReminder(reminder, steps);
  };

  const confirm = async () => {
    const outcome = await controls.confirm();

    await reminders.sync();

    if (outcome === ChallengeOutcomeEnum.RESET) {
      router.replace('/onboarding');

      return;
    }

    if (outcome === ChallengeOutcomeEnum.RESTARTED) {
      router.replace('/today');

      return;
    }

    // Nothing was changed — `restartChallenge` writes the new record before it clears anything —
    // so the screen stays where it is and says so, rather than navigating to a challenge that
    // does not exist.
    setDidActionFail(true);
    profile.refresh();
  };

  const runConfirm = () => {
    void confirm();
  };

  const runExport = () => {
    void transfer.exportBackup();
  };

  const runChooseFile = () => {
    void transfer.chooseFile();
  };

  const confirmImport = async () => {
    const imported = await transfer.confirmImport();

    if (!imported) {
      return;
    }

    await reminders.sync();

    // Everything on the device is now the backup's, including the challenge the tabs are built
    // from, so the user lands on Today and every screen reloads from what was just written.
    router.replace('/today');
  };

  const runConfirmImport = () => {
    void confirmImport();
  };

  if (settings.status === SettingsStatusEnum.LOADING) {
    return <SettingsLoading />;
  }

  if (settings.status === SettingsStatusEnum.UNAVAILABLE) {
    return <SettingsUnavailable onRetry={settings.refresh} />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader onBack={goBack} />

        <SettingsSection title={t('settings.sectionYou')}>
          <NameField
            value={name.draft}
            isSaved={name.isSaved}
            didFail={name.didFail}
            onChangeText={name.changeDraft}
            onSave={saveName}
          />
        </SettingsSection>

        <RemindersSection
          settings={settings.settings}
          isPermissionDenied={reminders.status === ReminderSyncEnum.PERMISSION_DENIED}
          onToggle={runToggleNotifications}
          onStep={runStepReminder}
        />

        <AppearanceSection isDark={settings.settings.darkMode} />

        <DataSection isBusy={transfer.isBusy} onExport={runExport} onImport={runChooseFile} />

        <TransferNote notice={transfer.notice} rejection={transfer.rejection} />

        <StartAgainSection
          mode={profile.mode}
          isRunning={controls.isRunning}
          onAsk={controls.ask}
        />

        <SettingsNote
          savedKey={null}
          failedKey={decideFailureKey(settings.didFail, didActionFail)}
        />

        <CreditsSection />
      </ScrollView>

      <ImportConfirmDialog
        pending={transfer.pending}
        isBusy={transfer.isBusy}
        onConfirm={runConfirmImport}
        onCancel={transfer.cancelImport}
      />

      <ChallengeConfirmDialog
        pending={controls.pending}
        isRunning={controls.isRunning}
        currentDay={profile.currentDay}
        mode={profile.mode}
        onConfirm={runConfirm}
        onCancel={controls.cancel}
      />
    </Screen>
  );
};

const decideFailureKey = (didSettingsFail: boolean, didActionFail: boolean): string | null => {
  if (didActionFail) {
    return 'settings.actionFailed';
  }

  if (didSettingsFail) {
    return 'settings.saveFailed';
  }

  return null;
};

/** The mode a restart inherits. Nothing is restarted without a challenge, so this is a fallback. */
const resolveMode = (mode: ChallengeMode | null): ChallengeMode => mode ?? ChallengeModeEnum.HARD;

const styles = StyleSheet.create({
  content: {
    gap: spacing.giant,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
});
