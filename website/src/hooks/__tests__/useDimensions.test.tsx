import { renderHook } from '@testing-library/react';
import useDimensions from '../useDimensions';
import { useRef } from 'react';

describe('useDimensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial dimensions of 0x0', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useDimensions(ref);
    });

    expect(result.current).toEqual({
      width: 0,
      height: 0,
    });
  });

  it('should return dimensions from ref element', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>({
        offsetWidth: 100,
        offsetHeight: 200,
      } as HTMLDivElement);
      return useDimensions(ref);
    });

    expect(result.current).toEqual({
      width: 100,
      height: 200,
    });
  });

  it('should handle null ref', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useDimensions(ref);
    });

    expect(result.current).toEqual({
      width: 0,
      height: 0,
    });
  });

  it('should subscribe to window resize events', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useDimensions(ref);
    });

    // Check that addEventListener was called with 'resize'
    expect(addEventListenerSpy).toHaveBeenCalled();
    const calls = addEventListenerSpy.mock.calls;
    const resizeCall = calls.find(call => call[0] === 'resize');
    expect(resizeCall).toBeDefined();

    addEventListenerSpy.mockRestore();
  });

  it('should cleanup on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useDimensions(ref);
    });

    unmount();

    // Check that removeEventListener was called
    expect(removeEventListenerSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
  });
});
