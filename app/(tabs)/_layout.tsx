import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { AppTabBar } from '@/components/AppTabBar';
import { TabBarButton } from '@/components/TabBarButton';
import { useTranslation } from '@/i18n';

/**
 * The headless tabs API, so the bar is entirely ours — the mockup's coral pill and type roles
 * rather than a themed navigator default.
 */
const TabsLayout = () => {
  const { t } = useTranslation();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <AppTabBar>
          <TabTrigger name="today" href="/today" asChild>
            <TabBarButton label={t('today.tabToday')} />
          </TabTrigger>
          <TabTrigger name="progress" href="/progress" asChild>
            <TabBarButton label={t('today.tabProgress')} />
          </TabTrigger>
          <TabTrigger name="journal" href="/journal" asChild>
            <TabBarButton label={t('today.tabJournal')} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabBarButton label={t('today.tabProfile')} />
          </TabTrigger>
        </AppTabBar>
      </TabList>
    </Tabs>
  );
};

export default TabsLayout;
