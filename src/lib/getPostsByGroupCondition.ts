/**
 * Groups an array of items by a key returned from a function.
 */
export function getPostsByGroupCondition<T>(
  posts: T[],
  groupFunction: (item: T, index?: number) => string | number | symbol
): Record<string | number | symbol, T[]> {
  const result: Record<string | number | symbol, T[]> = {};
  for (let i = 0; i < posts.length; i++) {
    const item = posts[i];
    const groupKey = groupFunction(item, i);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}
