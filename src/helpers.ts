export const rankBy = <T, U>(
    items: T[],
    comparator: (a: T, b: T) => number,
    getKey: (item: T) => U
): Map<U, number> =>
    new Map(
        items
            .sort((a, b) => comparator(a, b))
            .map((item, idx) => [getKey(item), idx + 1])
    );

export const indexBy = <T, U>(items: T[], getKey: (item: T) => U): Map<U, T> =>
    items.reduce((acc, item) => {
        acc.set(getKey(item), item);
        return acc;
    }, new Map());

export const groupBy = <T, U>(
    items: T[],
    getKey: (item: T) => U
): Map<U, T[]> =>
    items.reduce((acc, item) => {
        const key = getKey(item);
        const existingItemsForKey = acc.get(key) ?? [];
        acc.set(key, [...existingItemsForKey, item]);
        return acc;
    }, new Map());

export const clamp = (num: number, min: number, max: number): number =>
    Math.min(Math.max(num, min), max);

    //TODO make this better inclusive/exclusive. start from etc. 
export const range = (size: number): number[] => {
    return [...Array(size).keys()]
}