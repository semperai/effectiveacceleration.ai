export const uniqueBy = <T>(
  uniqueKey: keyof T,
  objects: T[],
  sortKey?: keyof T
): T[] => {
  const ids = objects.map((object) => object[uniqueKey]);
  const uniques = objects.filter(
    (object, index) => !ids.includes(object[uniqueKey], index + 1)
  );
  if (sortKey) {
    return uniques.sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1));
  }
  return uniques;
};
