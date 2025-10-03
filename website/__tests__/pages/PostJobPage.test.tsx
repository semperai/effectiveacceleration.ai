import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils';
import userEvent from '@testing-library/user-event';
import PostJobPage from '../../src/app/post-job/page';
import { useAccount } from 'wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/useConfig', () => ({
  useConfig: () => ({
    marketplaceAddress: '0xMarketplace',
    marketplaceDataAddress: '0xMarketplaceData',
  }),
}));

describe('PostJobPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });
  });

  it('should render job creation form', () => {
    render(<PostJobPage />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const submitButton = screen.getByText(/post job/i);
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('should accept job title input', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.type(titleInput, 'Test Job Title');

    expect(titleInput.value).toBe('Test Job Title');
  });

  it('should accept job description', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    await user.type(descInput, 'Test job description');

    expect(descInput.value).toBe('Test job description');
  });

  it('should allow tag selection', async () => {
    const user = userEvent.setup();
    render(<PostJobPage />);

    const tagSelect = screen.getByLabelText(/tags/i);
    await user.click(tagSelect);

    const audioTag = screen.getByText(/digital audio/i);
    await user.click(audioTag);

    expect(screen.getByText(/digital audio/i)).toBeInTheDocument();
  });

  it('should show arbitrator selection', () => {
    render(<PostJobPage />);

    expect(screen.getByText(/arbitrator/i)).toBeInTheDocument();
  });

  it('should show payment input', () => {
    render(<PostJobPage />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it('should show delivery timeline input', () => {
    render(<PostJobPage />);

    expect(screen.getByLabelText(/delivery time/i)).toBeInTheDocument();
  });

  it('should redirect to connect wallet if not connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    render(<PostJobPage />);

    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });
});
