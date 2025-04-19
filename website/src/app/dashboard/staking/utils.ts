import { formatEther } from 'viem';

// Input validation function
export const validateAmount = (value: string, maxAmount: bigint) => {
  // Remove non-numeric characters except decimal point
  const sanitizedValue = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = sanitizedValue.split('.');
  const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

  // Compare with max amount if provided
  if (maxAmount && cleanValue) {
    try {
      const inputAmount = parseFloat(cleanValue);
      const maxAmountFloat = parseFloat(formatEther(maxAmount));

      if (inputAmount > maxAmountFloat) {
        return maxAmountFloat.toString();
      }
    } catch (error) {
      console.error("Error comparing amounts:", error);
    }
  }

  return cleanValue;
};
