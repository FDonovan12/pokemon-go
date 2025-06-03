import { defineIfNotExists } from 'polyfills/utils';

export {};

declare global {
    interface Array<T> {
        /**
         * Returns the first element of the array, or `undefined` if the array is empty.
         */
        first(): T | undefined;

        /**
         * Returns the last element of the array, or `undefined` if the array is empty.
         */
        last(): T | undefined;

        /**
         * Calculates the sum of the array values.
         * - If the array is of type `number[]`, no callback is required.
         * - Otherwise, a callback must be provided to extract a numeric value.
         *
         * @param callback - Optional function that returns a `number` from an item.
         * @throws {Error} If no callback is provided for a non-number array.
         * @returns The sum of the values.
         */
        sum(this: number[]): number;
        sum(this: T[], callback: (item: T) => number): number;

        /**
         * Returns a new array with only unique elements (based on strict equality).
         */
        unique(): T[];

        /**
         * Splits the array into chunks of the given size.
         * @param size - Maximum size of each chunk.
         */
        chunk(size: number): T[][];

        /**
         * Calculates the average of the array values.
         * - If the array is of type `number[]`, no callback is required.
         * - Otherwise, a callback must be provided to extract a numeric value.
         *
         * @param callback - Optional function that returns a `number` from an item.
         * @throws {Error} If no callback is provided for a non-number array.
         * @returns The average of the values.
         */
        average(this: number[]): number;
        average(this: T[], callback: (item: T) => number): number;

        /**
         * Groups the array elements based on a key returned by the callback function.
         * @param callback - Function that returns a key to group by.
         * @returns An object where keys are the group names and values are arrays of grouped items.
         */
        groupBy(callback: (item: T) => string | number): Record<string | number, T[]>;

        /**
         * Removes all falsy values (`false`, `null`, `0`, `""`, `undefined`, and `NaN`) from the array.
         * @returns A new array with all falsy values removed.
         */
        compact(): T[];

        /**
         * Enumerates the array into tuples [value, index].
         * Similar to Python's enumerate but returns value first.
         * @returns An array of [value, index] pairs.
         */
        enumerate(): [T, number][];

        /**
         * Swaps the values at two indices in the array.
         * @param i First index
         * @param j Second index
         * @returns The array itself after swapping
         */
        swap(i: number, j: number): this;
    }
}

defineIfNotExists(Array.prototype, 'first', function <T>(this: T[]): T | undefined {
    return this[0];
});

defineIfNotExists(Array.prototype, 'last', function <T>(this: T[]): T | undefined {
    return this[this.length - 1];
});

defineIfNotExists(Array.prototype, 'sum', function <T>(this: T[], callback?: (item: T) => number): number {
    if (typeof callback === 'function') {
        return this.reduce((acc: number, item: T) => acc + callback(item), 0);
    }
    if (this.every((item) => typeof item === 'number')) {
        return (this as number[]).reduce((acc: number, item: number) => acc + item, 0);
    }
    throw new Error('Array.prototype.sum() requires a callback unless array is number[]');
});

defineIfNotExists(Array.prototype, 'unique', function <T>(this: T[]): T[] {
    return [...new Set(this)];
});

defineIfNotExists(Array.prototype, 'chunk', function <T>(this: T[], size: number): T[][] {
    if (typeof size !== 'number' || !Number.isInteger(size) || size <= 0) {
        throw new TypeError('Chunk size must be a positive integer');
    }
    const result: T[][] = [];
    for (let i = 0; i < this.length; i += size) {
        result.push(this.slice(i, i + size));
    }
    return result;
});

defineIfNotExists(Array.prototype, 'average', function <T>(this: T[], callback?: (item: T) => number): number {
    if (this.length === 0) return 0;
    if (typeof callback === 'function') {
        return this.reduce((acc: number, item: T) => acc + callback(item), 0) / this.length;
    }
    if (this.every((item) => typeof item === 'number')) {
        return (this as number[]).reduce((acc: number, item: number) => acc + item, 0) / this.length;
    }
    throw new Error('Array.prototype.average() requires a callback unless array is number[]');
});

defineIfNotExists(Array.prototype, 'groupBy', function <T>(this: T[], callback: (item: T) => string | number): Record<
    string | number,
    T[]
> {
    if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
    }
    const result: Record<string, T[]> = {};
    this.forEach((item: T) => {
        const key = callback(item);
        if (typeof key !== 'string' && typeof key !== 'number') {
            throw new TypeError('groupBy callback must return a string or number');
        }
        if (!result[key]) result[key] = [];
        result[key].push(item);
    });
    return result;
});

defineIfNotExists(Array.prototype, 'compact', function <T>(this: T[]): T[] {
    return this.filter(Boolean);
});

defineIfNotExists(Array.prototype, 'enumerate', function <T>(this: T[]): [T, number][] {
    return this.map((value, index) => [value, index]);
});

defineIfNotExists(Array.prototype, 'swap', function <T>(this: T[], i: number, j: number): T[] {
    if (typeof i !== 'number' || typeof j !== 'number' || !Number.isInteger(i) || !Number.isInteger(j)) {
        throw new TypeError('Indices must be integers');
    }
    if (i < 0 || i >= this.length || j < 0 || j >= this.length) {
        throw new RangeError('Index out of bounds');
    }
    if (i !== j) {
        const temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
});
