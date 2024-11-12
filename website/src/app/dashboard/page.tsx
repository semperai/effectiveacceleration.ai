'use client';
import { Layout } from '@/components/Dashboard/Layout';
import React from 'react';
import DashboardTabs from '@/components/Dashboard/JobsTables/DashboardTabs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/owner-job-list');
  }, [router]);

  return (
    <Layout>
      <></>
    </Layout>
  );
}
