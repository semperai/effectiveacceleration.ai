import { WeeklyDistributionData } from './types';

// This is mock data - replace with actual data from your API or blockchain
export const mockWeeklyData: WeeklyDistributionData[] = [
  {
    weekNumber: 1,
    startDate: '2025-01-06',
    endDate: '2025-01-12',
    totalDistributed: 10000,
    highlights: ['First week of distributions', 'Record community engagement'],
    contributors: [
      {
        name: 'alice.eth',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6',
        amount: 2500,
        percentage: 25,
        txHash:
          '0xabc123def456789012345678901234567890123456789012345678901234567890',
        category: 'Content Creation',
      },
      {
        name: 'bob_builder',
        address: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
        amount: 2000,
        percentage: 20,
        txHash:
          '0xdef456789012345678901234567890123456789012345678901234567890abcd',
        category: 'Community Building',
      },
      {
        name: 'carol_dev',
        address: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        amount: 1500,
        percentage: 15,
        txHash:
          '0x789012345678901234567890123456789012345678901234567890abcdef1234',
        category: 'Open Source Agents',
      },
      {
        name: 'david_marketer',
        address: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        amount: 1000,
        percentage: 10,
        txHash:
          '0x345678901234567890123456789012345678901234567890abcdef1234567890',
        category: 'Social Media',
      },
      {
        name: 'eve_creator',
        address: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
        amount: 3000,
        percentage: 30,
        txHash:
          '0x901234567890123456789012345678901234567890abcdef12345678901234567',
        category: 'Partnerships',
      },
    ],
  },
  {
    weekNumber: 2,
    startDate: '2025-01-13',
    endDate: '2025-01-19',
    totalDistributed: 10000,
    highlights: ['New partnership announcement', '50+ new content creators'],
    contributors: [
      {
        name: 'frank_podcaster',
        address: '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC',
        amount: 3500,
        percentage: 35,
        txHash:
          '0x567890123456789012345678901234567890abcdef123456789012345678901234',
        category: 'Podcast Appearances',
      },
      {
        name: 'grace_writer',
        address: '0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9',
        amount: 2500,
        percentage: 25,
        txHash:
          '0x234567890123456789012345678901234567890abcdef12345678901234567890',
        category: 'Articles',
      },
      {
        name: 'henry_dev',
        address: '0x28a8746e75304c0780E011BEd21C72cD78cd535E',
        amount: 4000,
        percentage: 40,
        txHash:
          '0x890123456789012345678901234567890abcdef1234567890123456789012345678',
        category: 'Open Source Agents',
      },
    ],
  },
  // Add more weeks here as needed
];

// Helper function to add a new week's data
export function addWeeklyDistribution(weekData: WeeklyDistributionData): void {
  // In a real implementation, this would save to your database/API
  mockWeeklyData.push(weekData);
}

// Template for creating new weekly distribution data
export const weeklyDistributionTemplate: WeeklyDistributionData = {
  weekNumber: 3, // Update with actual week number
  startDate: '2025-01-20', // Update with actual start date
  endDate: '2025-01-26', // Update with actual end date
  totalDistributed: 10000, // Update with actual total
  highlights: ['Add highlights here'], // Add any highlights for the week
  contributors: [
    {
      name: 'contributor_name',
      address: '0x0000000000000000000000000000000000000000',
      amount: 0,
      percentage: 0,
      txHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      category: 'Category Name',
    },
    // Add more contributors as needed
  ],
};

// Example of how to add a new week:
/*
const newWeek: WeeklyDistributionData = {
  weekNumber: 3,
  startDate: '2025-01-20',
  endDate: '2025-01-26',
  totalDistributed: 10000,
  highlights: ['Major milestone reached', 'New integration launched'],
  contributors: [
    {
      name: 'new_contributor',
      address: '0x1234567890123456789012345678901234567890',
      amount: 5000,
      percentage: 50,
      txHash: '0xabcdef1234567890123456789012345678901234567890abcdef1234567890',
      category: 'Content Creation'
    },
    // ... more contributors
  ]
};

addWeeklyDistribution(newWeek);
*/
