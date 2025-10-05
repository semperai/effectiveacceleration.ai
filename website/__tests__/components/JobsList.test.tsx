import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../setup/test-utils';
import { JobsList } from '../../src/components/Dashboard/JobsList/JobsList';
import userEvent from '@testing-library/user-event';

describe.skip('JobsList Component', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'AI Model Training',
      state: 0, // Open
      amount: '1000000',
      token: '0xUSDC',
      createdAt: '1234567890',
      roles: {
        creator: '0xCreator',
        worker: null,
        arbitrator: '0xArbitrator',
      },
    },
    {
      id: '2',
      title: 'Data Analysis',
      state: 1, // Taken
      amount: '500000',
      token: '0xUSDT',
      createdAt: '1234567891',
      roles: {
        creator: '0xCreator',
        worker: '0xWorker',
        arbitrator: '0xArbitrator',
      },
    },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of jobs', () => {
    render(<JobsList jobs={mockJobs} />);

    expect(screen.getByText('AI Model Training')).toBeInTheDocument();
    expect(screen.getByText('Data Analysis')).toBeInTheDocument();
  });

  it('should render empty div when no jobs provided', () => {
    const { container } = render(<JobsList />);

    expect(container.querySelector('.space-y-3')).toBeInTheDocument();
  });

  it('should render empty div when empty array provided', () => {
    const { container } = render(<JobsList jobs={[]} />);

    expect(container.querySelector('.space-y-3')).toBeInTheDocument();
  });

  it('should render all jobs from array', () => {
    render(<JobsList jobs={mockJobs} />);

    expect(screen.getByText('AI Model Training')).toBeInTheDocument();
    expect(screen.getByText('Data Analysis')).toBeInTheDocument();
  });
});
