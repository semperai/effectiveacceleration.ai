import clsx from 'clsx'
import { Layout } from '@/components/Dashboard/Layout'
import { Link } from '@/components/Link'
import { Logo } from '@/components/Logo'
import { Text } from '@/components/Text'
import React from 'react'
import DashboardTabs from '@/components/Dashboard/JobsTables/DashboardTabs'

export default function IndexPage() {
return (
    <Layout>
      <DashboardTabs></DashboardTabs>
    </Layout>
  );
}
