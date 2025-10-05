import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useToast } from '../../src/hooks/useToast';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide toast functions', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty('showError');
    expect(result.current).toHaveProperty('showWarning');
    expect(result.current).toHaveProperty('showSuccess');
    expect(result.current).toHaveProperty('showLoading');
    expect(result.current).toHaveProperty('toast');
  });

  it('should call toast.error with correct params', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showError('Error message');
    });

    expect(toast.error).toHaveBeenCalledWith('Error message', {
      duration: 4000,
    });
  });

  it('should call toast.warning with correct params', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showWarning('Warning message');
    });

    expect(toast.warning).toHaveBeenCalledWith('Warning message', {
      duration: 3500,
    });
  });

  it('should call toast.success with correct params', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(toast.success).toHaveBeenCalledWith('Success message', {
      duration: 3000,
    });
  });

  it('should call toast.loading with correct params', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showLoading('Loading message');
    });

    expect(toast.loading).toHaveBeenCalledWith('Loading message', {
      duration: Infinity,
    });
  });

  it('should expose raw toast function', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toast).toBe(toast);
  });
});
