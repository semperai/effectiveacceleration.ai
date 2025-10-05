import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { DeliverResultButton } from '../../src/app/jobs/[id]/JobActions/DeliverResultButton';
import { useAccount, useWriteContract } from 'wagmi';

// Mock hooks
vi.mock('@/hooks/useConfig', () => ({
  useConfig: () => ({
    marketplaceAddress: '0xMarketplace',
    marketplaceDataAddress: '0xMarketplaceData',
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/hooks/useWriteContractWithNotifications', () => ({
  useWriteContractWithNotifications: () => ({
    writeContract: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
}));

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useWriteContract: vi.fn(),
  useSignMessage: vi.fn(() => ({
    signMessageAsync: vi.fn(),
  })),
  useConfig: vi.fn(() => ({})),
}));

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
  readContract: vi.fn(),
}));

describe.skip('DeliverResultButton', () => {
  const mockJob = {
    id: '1',
    state: 'Taken',
    roles: {
      creator: '0xCreator',
      worker: '0xWorker',
      arbitrator: '0xArbitrator',
    },
  };

  const mockEvents = [] as any;

  const mockWriteContract = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useWriteContract as any).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isSuccess: false,
    });
  });

  it('should render deliver button for assigned worker', () => {
    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<DeliverResultButton address="0xWorker" job={mockJob} events={mockEvents} />);

    expect(screen.getByText(/deliver/i)).toBeInTheDocument();
  });

  it('should not show for non-worker', () => {
    (useAccount as any).mockReturnValue({
      address: '0xCreator',
      isConnected: true,
    });

    const { container } = render(<DeliverResultButton address="0xWorker" job={mockJob} events={mockEvents} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should show result input dialog on click', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<DeliverResultButton address="0xWorker" job={mockJob} events={mockEvents} />);

    const button = screen.getByText(/deliver/i);
    await user.click(button);

    expect(screen.getByText(/enter result/i)).toBeInTheDocument();
  });

  it('should submit result with IPFS hash', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<DeliverResultButton address="0xWorker" job={mockJob} events={mockEvents} />);

    // Open dialog
    await user.click(screen.getByText(/deliver/i));

    // Enter IPFS hash
    const resultInput = screen.getByLabelText(/result/i);
    await user.type(resultInput, 'QmXyZ123...');

    // Submit
    const submitButton = screen.getByText(/submit/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'deliverJob',
          args: expect.arrayContaining([mockJob.id, 'QmXyZ123...']),
        })
      );
    });
  });

  it('should validate result input', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    render(<DeliverResultButton address="0xWorker" job={mockJob} events={mockEvents} />);

    await user.click(screen.getByText(/deliver/i));

    // Try to submit without entering result
    const submitButton = screen.getByText(/submit/i);
    await user.click(submitButton);

    expect(screen.getByText(/result is required/i)).toBeInTheDocument();
  });

  it('should only be available for taken jobs', () => {
    (useAccount as any).mockReturnValue({
      address: '0xWorker',
      isConnected: true,
    });

    const openJob = { ...mockJob, state: 'Open' };
    const { container } = render(<DeliverResultButton job={openJob} />);

    expect(container).toBeEmptyDOMElement();
  });
});
