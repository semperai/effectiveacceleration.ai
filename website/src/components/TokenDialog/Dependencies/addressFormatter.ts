

export const reduceAddress = (address: string) => {
  // it's an ens
  if (address.includes(".")) return address;

  const start = address.substring(0, 6);
  const middle = "...";
  const end = address.substring(address.length - 4);

  return `${start}${middle}${end}`;
};