export interface Contributor {
  name: string;
  address: string;
  amount: number;
  percentage: number;
  txHash: string;
  category?: string;
}

export interface WeeklyDistributionData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalDistributed: number;
  contributors: Contributor[];
  highlights?: string[];
}

export interface CategoryConfig {
  color:
    | 'blue'
    | 'purple'
    | 'green'
    | 'pink'
    | 'orange'
    | 'indigo'
    | 'teal'
    | 'gray';
  icon: React.ReactNode;
}

export interface StatsData {
  totalDistributed: number;
  totalContributors: number;
  weeksCompleted: number;
  weeksRemaining: number;
  weeklyAverage: number;
}
