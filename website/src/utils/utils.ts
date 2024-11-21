export function shortenText({
  text,
  maxLength,
}: {
  text: string | `0x${string}` | undefined;
  maxLength: number;
}) {
  if (!text) return console.log('No text provided');
  if (text.length <= maxLength) {
    return text;
  }

  const partLength = Math.floor((maxLength - 3) / 2); // Subtract 3 for the ellipsis
  const start = text.slice(0, partLength + 1);
  const end = text.slice(-partLength + 1);

  return `${start}...${end}`;
}

export const convertToSeconds = (deadline: number, unit: string): number => {
  switch (unit) {
    case 'minutes':
      return deadline * 60;
    case 'hours':
      return deadline * 60 * 60;
    case 'days':
      return deadline * 60 * 60 * 24;
    case 'weeks':
      return deadline * 60 * 60 * 24 * 7;
    case 'months':
      return deadline * 60 * 60 * 24 * 30; // Approximation
    case 'years':
      return deadline * 60 * 60 * 24 * 365; // Approximation
    default:
      return 0;
  }
};

export const convertSecondsToDays = (seconds: number): number => {
  return seconds / (60 * 60 * 24);
};


export const unitsDeliveryTime = [
  { id: 0, name: 'minutes' },
  { id: 1, name: 'hours' },
  { id: 2, name: 'days' },
  { id: 3, name: 'weeks' },
  { id: 4, name: 'months' },
  { id: 5, name: 'years' },
];