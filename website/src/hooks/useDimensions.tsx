import { type RefObject, useMemo, useSyncExternalStore } from 'react';

type ThrottleFunction = (...args: any[]) => void;

interface Dimensions {
  width: number;
  height: number;
}

function throttle(func: ThrottleFunction, limit: number): ThrottleFunction {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function useDimensions(ref: RefObject<HTMLElement>): Dimensions {
  const getServerSnapshot = (): string =>
    JSON.stringify({
      width: 0, // Default width when server rendering
      height: 0, // Default height when server rendering
    });

  const subscribe = (callback: () => void): (() => void) => {
    const throttledCallback = throttle(callback, 100); // Throttle callback, 100ms limit
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', throttledCallback);
      return () => window.removeEventListener('resize', throttledCallback);
    }
    return () => {}; // No-op for SSR
  };

  const dimensions = useSyncExternalStore(
    subscribe,
    (): string =>
      JSON.stringify({
        width:
          typeof window !== 'undefined' ? (ref.current?.offsetWidth ?? 0) : 0,
        height:
          typeof window !== 'undefined' ? (ref.current?.offsetHeight ?? 0) : 0,
      }),
    getServerSnapshot // Provide the getServerSnapshot function
  );

  return useMemo(() => JSON.parse(dimensions), [dimensions]);
}

export default useDimensions;
