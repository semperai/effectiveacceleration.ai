import { Layout } from '@/components/Dashboard/Layout'
import React from 'react'
import DashboardWorkerTabs from '@/components/Dashboard/JobsTables/DashboardWorkerTabs'

export default function OwnerJobListPage() {
return (
    <Layout>
      <DashboardWorkerTabs></DashboardWorkerTabs>
    </Layout>
  );
}
