import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import SettingsTabs, { type SettingsTab } from '../../components/pages/settings/SettingsTabs';
import ProfileSection from '../../components/pages/settings/ProfileSection';
import SystemThresholds from '../../components/pages/settings/SystemThresholds';
import UserManagement from '../../components/pages/settings/UserManagement';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <>
      <Helmet>
        <title>Pengaturan Konfigurasi | Penjamu Handal</title>
        <meta name="description" content="Pengaturan sistem, profil, ambang batas produksi, dan manajemen hak akses Penjamu Handal." />
      </Helmet>

      <AppShell>
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-[1400px] w-full mx-auto pb-24">
            {/* Page Header */}
            <div className="px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">
                Konfigurasi Konsol
              </h2>
              <p className="text-on-surface-variant font-body mt-2 text-sm sm:text-base">
                Mempersonalisasi dan mensinkronisasikan instrumen digital laboratorium apotekeri serta hierarki tim.
              </p>
            </div>

            {/* Content Area */}
            <div className="px-4 sm:px-6 md:px-12">
              <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'thresholds' && <SystemThresholds />}
              {activeTab === 'users' && <UserManagement />}
            </div>
          </main>
        </div>
      </AppShell>
    </>
  );
}
