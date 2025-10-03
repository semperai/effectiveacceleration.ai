import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils';
import userEvent from '@testing-library/user-event';
import ConnectWallet from '../../src/app/register/ConnectWallet';
import { useAccount } from 'wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useConnect: jest.fn(),
}));

describe('ConnectWallet Component', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render connect wallet button when not connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/connect/i)).toBeInTheDocument();
  });

  it('should show connected state when wallet is connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123...abc',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it('should call onNext when connected and continue clicked', async () => {
    const user = userEvent.setup();

    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    const continueButton = screen.getByText(/continue/i);
    await user.click(continueButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should display wallet address when connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });

    render(<ConnectWallet onNext={mockOnNext} />);

    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });
});
