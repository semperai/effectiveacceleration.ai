import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import { OwnerDashboardTabs } from '@/components/Dashboard/JobsTables/OwnerDashboardTabs';

export default function OwnerJobListPage() {
  return (
    <Layout>
      <OwnerDashboardTabs />
    </Layout>
  );
}
