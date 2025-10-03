/**
 * Integration Test: Complete Job Creation Flow
 *
 * This test covers the entire job creation workflow:
 * 1. Connect wallet
 * 2. Fill job form
 * 3. Approve token spending
 * 4. Submit job transaction
 * 5. View created job
 */

import { render, screen, waitFor } from '@/__tests__/setup/test-utils';
import userEvent from '@testing-library/user-event';
import { useAccount, useWriteContract } from 'wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useWriteContract: jest.fn(),
  useBalance: jest.fn(() => ({ data: { value: BigInt(1000000000) } })),
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/post-job',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Job Creation Flow Integration', () => {
  const mockWriteContract = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useWriteContract as jest.Mock).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isSuccess: false,
    });
  });

  it('should complete full job creation workflow', async () => {
    const user = userEvent.setup();

    // Step 1: Connect wallet
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });

    // Render post job page
    const PostJobPage = require('@/app/post-job/PostJobPage').default;
    render(<PostJobPage />);

    // Step 2: Fill job form
    await user.type(screen.getByLabelText(/title/i), 'AI Model Training');
    await user.type(
      screen.getByLabelText(/description/i),
      'Need help training a large language model'
    );

    // Select tags
    await user.click(screen.getByLabelText(/tags/i));
    await user.click(screen.getByText(/software/i));

    // Set payment
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '1000');

    // Select token (USDC)
    await user.click(screen.getByText(/select token/i));
    await user.click(screen.getByText(/USDC/i));

    // Set delivery time
    const timeInput = screen.getByLabelText(/delivery time/i);
    await user.clear(timeInput);
    await user.type(timeInput, '7');
    await user.selectOptions(screen.getByLabelText(/time unit/i), 'days');

    // Select arbitrator
    await user.click(screen.getByLabelText(/arbitrator/i));
    await user.click(screen.getAllByText(/arbitrator/i)[1]); // Select first arbitrator

    // Step 3: Approve token (if needed)
    const approveButton = screen.queryByText(/approve/i);
    if (approveButton) {
      await user.click(approveButton);

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            functionName: 'approve',
          })
        );
      });
    }

    // Step 4: Submit job
    const submitButton = screen.getByText(/post job/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'createJob',
          args: expect.arrayContaining([
            expect.any(String), // title
            expect.any(String), // content
            expect.any(Array), // tags
            expect.any(String), // token
            expect.any(BigInt), // amount
            expect.any(BigInt), // maxTime
            expect.any(String), // delivery method
            expect.any(String), // arbitrator
          ]),
        })
      );
    });
  });

  it('should handle validation errors', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });

    const PostJobPage = require('@/app/post-job/PostJobPage').default;
    render(<PostJobPage />);

    // Try to submit without filling form
    const submitButton = screen.getByText(/post job/i);
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('should handle insufficient balance', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });

    // Mock zero balance
    const { useBalance } = require('wagmi');
    (useBalance as jest.Mock).mockReturnValue({
      data: { value: BigInt(0) },
    });

    const PostJobPage = require('@/app/post-job/PostJobPage').default;
    render(<PostJobPage />);

    // Fill form with amount higher than balance
    await user.type(screen.getByLabelText(/amount/i), '10000');

    await waitFor(() => {
      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    });
  });
});
