import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils';
import userEvent from '@testing-library/user-event';
import TakeJobButton from '../TakeJobButton';
import { useAccount, useWriteContract } from 'wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useWriteContract: jest.fn(),
}));

describe('TakeJobButton', () => {
  const mockJob = {
    id: '1',
    state: 'Open',
    roles: {
      creator: '0xCreator',
      worker: null,
      arbitrator: '0xArbitrator',
    },
    collateralOwed: BigInt(0),
  };

  const mockWriteContract = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useWriteContract as jest.Mock).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isSuccess: false,
    });
  });

  it('should render take job button for open job', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<TakeJobButton job={mockJob} />);

    expect(screen.getByText(/take job/i)).toBeInTheDocument();
  });

  it('should not show for job creator', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    const { container } = render(<TakeJobButton job={mockJob} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should call takeJob contract function on click', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<TakeJobButton job={mockJob} />);

    const button = screen.getByText(/take job/i);
    await user.click(button);

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'takeJob',
        args: expect.arrayContaining([mockJob.id]),
      })
    );
  });

  it('should show loading state when transaction pending', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    (useWriteContract as jest.Mock).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: true,
      isSuccess: false,
    });

    render(<TakeJobButton job={mockJob} />);

    expect(screen.getByText(/taking/i)).toBeInTheDocument();
  });

  it('should be disabled for taken job', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    const takenJob = { ...mockJob, state: 'Taken', roles: { ...mockJob.roles, worker: '0xOtherWorker' } };

    render(<TakeJobButton job={takenJob} />);

    const button = screen.queryByText(/take job/i);
    expect(button).not.toBeInTheDocument();
  });

  it('should handle collateral requirement', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    const jobWithCollateral = {
      ...mockJob,
      collateralOwed: BigInt(1000000),
    };

    render(<TakeJobButton job={jobWithCollateral} />);

    const button = screen.getByText(/take job/i);
    await user.click(button);

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        value: jobWithCollateral.collateralOwed,
      })
    );
  });
});
