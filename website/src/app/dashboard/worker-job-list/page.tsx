import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import { WorkerDashboardTabs } from '@/components/Dashboard/JobsTables/WorkerDashboardTabs';

export default function OwnerJobListPage() {
  return (
    <Layout>
      <WorkerDashboardTabs />
    </Layout>
  );
}
