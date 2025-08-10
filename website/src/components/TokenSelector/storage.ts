// src/components/TokenSelector/utils/storage.ts

/**
 * Simple localStorage wrapper for token selector
 * Replaces the complex lscache module with a straightforward implementation
 */

const STORAGE_KEYS = {
  PREFERRED_TOKENS: 'eacc-tokenselector-preferred',
  CUSTOM_TOKENS: 'eacc-tokenselector-custom',
  LAST_TOKEN_SELECTED: 'eacc-tokenselector-last',
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

const storage = {
  /**
   * Get a value from localStorage
   * @param key The storage key
   * @returns The parsed value or null if not found/error
   */
  get: (key: StorageKey): any => {
    try {
      const storageKey = STORAGE_KEYS[key];
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },

  /**
   * Set a value in localStorage
   * @param key The storage key
   * @param value The value to store
   * @returns true if successful, false otherwise
   */
  set: (key: StorageKey, value: any): boolean => {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @param key The storage key
   */
  remove: (key: StorageKey): void => {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },

  /**
   * Clear all token selector related data from localStorage
   */
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(storageKey => {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error(`Error clearing localStorage:`, error);
      }
    });
  }
};

export default storage;
