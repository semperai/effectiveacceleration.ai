import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils';
import userEvent from '@testing-library/user-event';
import AcceptButton from '../AcceptButton';
import { useAccount, useWriteContract } from 'wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useWriteContract: jest.fn(),
}));

describe('AcceptButton', () => {
  const mockJob = {
    id: '1',
    state: 'Taken',
    roles: {
      creator: '0xCreator',
      worker: '0xWorker',
      arbitrator: '0xArbitrator',
    },
    result: 'QmDeliveredResult',
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

  it('should render accept button for job creator', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    render(<AcceptButton job={mockJob} />);

    expect(screen.getByText(/accept/i)).toBeInTheDocument();
  });

  it('should not show for non-creator', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    const { container } = render(<AcceptButton job={mockJob} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should call acceptJob contract function', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    render(<AcceptButton job={mockJob} />);

    const button = screen.getByText(/accept/i);
    await user.click(button);

    // Confirm in dialog
    const confirmButton = screen.getByText(/confirm/i);
    await user.click(confirmButton);

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'completeJob',
        args: expect.arrayContaining([mockJob.id]),
      })
    );
  });

  it('should show confirmation dialog', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    render(<AcceptButton job={mockJob} />);

    const button = screen.getByText(/accept/i);
    await user.click(button);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/this will release payment/i)).toBeInTheDocument();
  });

  it('should only show for jobs with delivered results', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    const jobWithoutResult = { ...mockJob, result: null };
    const { container } = render(<AcceptButton job={jobWithoutResult} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show rating dialog after acceptance', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    (useWriteContract as jest.Mock).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isSuccess: true,
    });

    render(<AcceptButton job={mockJob} />);

    const button = screen.getByText(/accept/i);
    await user.click(button);

    const confirmButton = screen.getByText(/confirm/i);
    await user.click(confirmButton);

    // After success, should show rating dialog
    expect(screen.getByText(/rate worker/i)).toBeInTheDocument();
  });
});
