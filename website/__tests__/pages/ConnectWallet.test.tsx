import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../setup/test-utils';
import userEvent from '@testing-library/user-event';
import ConnectWallet from '../../src/app/register/ConnectWallet';
import { useAccount } from 'wagmi';

// Mock wagmi
vi.mock('wagmi', () => ({
  ...vi.importActual('wagmi'),
  useAccount: vi.fn(),
  useConnect: vi.fn(),
}));

describe.skip('ConnectWallet Component', () => {
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render connect wallet button when not connected', () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/connect/i)).toBeInTheDocument();
  });

  it('should show connected state when wallet is connected', () => {
    (useAccount as any).mockReturnValue({
      address: '0x123...abc',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it('should call onNext when connected and continue clicked', async () => {
    const user = userEvent.setup();

    (useAccount as any).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    const continueButton = screen.getByText(/continue/i);
    await user.click(continueButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should display wallet address when connected', () => {
    (useAccount as any).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });
});
