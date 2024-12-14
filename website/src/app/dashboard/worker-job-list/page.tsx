import { Layout } from '@/components/Dashboard/Layout';
import { WorkerDashboardTabs } from '@/components/Dashboard/JobsList/WorkerDashboardTabs';

export default function WorkerJobListPage() {
  return (
    <Layout>
      <WorkerDashboardTabs />
    </Layout>
  );
}
