export function shortenText({
  text,
  maxLength,
}: {
  text: string | string | undefined;
  maxLength: number;
}): string {
  if (!text) {
    console.error('No text provided');
    return '';
  }
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

export const getUnitAndValueFromSeconds = (
  seconds: number
): {
  unit: string;
  value: number;
} => {
  const years = seconds / (60 * 60 * 24 * 7 * 4 * 12);
  const months = seconds / (60 * 60 * 24 * 7 * 4);
  const weeks = seconds / (60 * 60 * 24 * 7);
  const days = seconds / (60 * 60 * 24);
  const hours = seconds / (60 * 60);
  const minutes = seconds / 60;

  if (years % 1 === 0) {
    return { unit: 'years', value: years };
  } else if (months % 1 === 0) {
    return { unit: 'months', value: months };
  } else if (weeks % 1 === 0) {
    return { unit: 'weeks', value: weeks };
  } else if (days % 1 === 0) {
    return { unit: 'days', value: days };
  } else if (hours % 1 === 0) {
    return { unit: 'hours', value: hours };
  } else {
    return { unit: 'minutes', value: minutes };
  }
};

export const unitsDeliveryTime = [
  { id: 0, name: 'minutes' },
  { id: 1, name: 'hours' },
  { id: 2, name: 'days' },
  { id: 3, name: 'weeks' },
  { id: 4, name: 'months' },
  { id: 5, name: 'years' },
];
