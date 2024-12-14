import { Layout } from '@/components/Dashboard/Layout';
import { OwnerDashboardTabs } from '@/components/Dashboard/JobsList/OwnerDashboardTabs';

export default function OwnerJobListPage() {
  return (
    <Layout>
      <OwnerDashboardTabs />
    </Layout>
  );
}
