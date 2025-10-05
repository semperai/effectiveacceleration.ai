import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../setup/test-utils';
import userEvent from '@testing-library/user-event';
import AcceptButton from '../../src/app/jobs/[id]/JobActions/AcceptButton';
import { useAccount, useWriteContract } from 'wagmi';

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useWriteContract: vi.fn(),
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

  const mockWriteContract = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isSuccess: false,
    });
  });

  it('should render accept button for job creator', () => {
    (useAccount as any).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    render(<AcceptButton job={mockJob} />);

    expect(screen.getByText(/accept/i)).toBeInTheDocument();
  });

  it('should not show for non-creator', () => {
    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    const { container } = render(<AcceptButton job={mockJob} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should call acceptJob contract function', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
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

    (useAccount as any).mockReturnValue({
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
    (useAccount as any).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    const jobWithoutResult = { ...mockJob, result: null };
    const { container } = render(<AcceptButton job={jobWithoutResult} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show rating dialog after acceptance', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    (useWriteContract as any).mockReturnValue({
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
