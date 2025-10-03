import React from 'react';
import { render, screen } from '../setup/test-utils';
import JobsList from '../../src/components/Dashboard/JobsList';
import { useJobs } from '@/hooks/subsquid/useJobs';

// Mock hooks
jest.mock('@/hooks/subsquid/useJobs');

describe('JobsList Component', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'AI Model Training',
      state: 'Open',
      amount: '1000000',
      token: '0xUSDC',
      createdAt: '1234567890',
    },
    {
      id: '2',
      title: 'Data Analysis',
      state: 'Taken',
      amount: '500000',
      token: '0xUSDT',
      createdAt: '1234567891',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list of jobs', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: { jobs: mockJobs },
      loading: false,
      error: null,
    });

    render(<JobsList />);

    expect(screen.getByText('AI Model Training')).toBeInTheDocument();
    expect(screen.getByText('Data Analysis')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<JobsList />);

    expect(screen.getByTestId('jobs-list-skeleton')).toBeInTheDocument();
  });

  it('should show empty state when no jobs', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: { jobs: [] },
      loading: false,
      error: null,
    });

    render(<JobsList />);

    expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch jobs'),
    });

    render(<JobsList />);

    expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
  });

  it('should display job status badges', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: { jobs: mockJobs },
      loading: false,
      error: null,
    });

    render(<JobsList />);

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Taken')).toBeInTheDocument();
  });

  it('should format job amounts correctly', () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: { jobs: mockJobs },
      loading: false,
      error: null,
    });

    render(<JobsList />);

    expect(screen.getByText(/1000/)).toBeInTheDocument(); // 1000 USDC
    expect(screen.getByText(/500/)).toBeInTheDocument(); // 500 USDT
  });

  it('should handle job click navigation', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    (useJobs as jest.Mock).mockReturnValue({
      data: { jobs: mockJobs },
      loading: false,
      error: null,
    });

    render(<JobsList />);

    const jobRow = screen.getByText('AI Model Training');
    await userEvent.click(jobRow);

    expect(mockPush).toHaveBeenCalledWith('/jobs/1');
  });
});
