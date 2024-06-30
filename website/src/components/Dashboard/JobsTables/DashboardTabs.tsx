'use client'
import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import OpenJobs from './JobsTablesData/OpenJobs';
import JobProgress from './JobsTablesData/JobProgress';
import CompletedJobs from './JobsTablesData/CompletedJobs';
import DisputedJobs from './JobsTablesData/DisputedJobs';
import ArchivedJobs from './JobsTablesData/ArchivedJobs';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens'
import TokenDialog from '@/components/TokenDialog'

interface IArbitrumToken {
  logoURI?: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  extensions?: any;
  l1Address?: string;
  l2GatewayAddress?: string;
  l1GatewayAddress?: string;
}

const DashboardTabs = () => {
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    arbitrumTokens.tokens[0],
  );
  const [preferredTokens, setPreferredTokens] = React.useState<
  IArbitrumToken[]
>([]);

const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] = React.useState(false);

  const [selectableTokens, setSelectableTokens] = React.useState<any>();
  return (
    <div className=''>
    <Tabs>
        <TabList className='flex border-b-2 borde-gray-100 mb-7'>
            <Tab selectedClassName='!border-lightPurple  border-b-2  !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
                Open Jobs
            </Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              In Progress</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Completed</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Disputed</Tab>
            <Tab selectedClassName='!border-lightPurple  border-b-2 !text-lightPurple'  className='px-8 py-2 font-medium relative cursor-pointer top-[2px] outline-none text-darkBlueFont'>
              Archived</Tab>
        </TabList>
        <TabPanel>
          <OpenJobs/>
        </TabPanel>
        <TabPanel>
          <JobProgress/>
        </TabPanel>
        <TabPanel>
          <CompletedJobs/>
        </TabPanel>
        <TabPanel>
          <DisputedJobs/>
        </TabPanel>        
        <TabPanel>
          <ArchivedJobs/>
        </TabPanel>
    </Tabs>
    <TokenDialog
            initiallySelectedToken={selectedToken}
            preferredTokenList={mockTokens(preferredTokens)}
            tokensList={selectableTokens?.tokens}
            closeCallback={(dialogSelectedToken: IArbitrumToken) => {
              if (dialogSelectedToken) {
                setSelectedToken(dialogSelectedToken);
              }
              setTokenSelectionDialogOpen(false);
              // getTokensFromLocalStorage();
            }}
        />
  </div>
  )
}

export default DashboardTabs