import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import DashboardTabs from '@/components/Dashboard/JobsTables/DashboardTabs';

export default function OwnerJobListPage() {
  return (
    <Layout>
      <DashboardTabs />
    </Layout>
  );
}
