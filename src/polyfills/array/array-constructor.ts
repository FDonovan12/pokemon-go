export {};

declare global {
    interface ArrayConstructor {
        /**
         * Combines multiple arrays element-wise, like Python's itertools.zip_longest .
         * @param arrays Arrays to zip together
         * @returns An array of arrays, each containing the i-th elements of the input arrays, undefined for the shortest arrays
         */
        zip(...arrays: any[][]): any[][];

        /**
         * Generates a sequence of numbers, similar to Python's range.
         * @param start First number, or length if end is not defined
         * @param end Last number (excluded)
         * @param step Step of the sequence (positive or negative)
         * @returns An array of numbers
         */
        range(start: number, end?: number, step?: number): number[];

        /**
         * Creates an array filled with the same value or a generated value.
         * @param length Length of the array
         * @param value Value or function generating a value
         * @returns Filled array
         */
        repeat<T>(length: number, value: T | (() => T)): T[];
    }
}
Array.zip = function (...arrays: any[][]): any[][] {
    if (arrays.length === 0) return [];
    const maxLen = Math.max(...arrays.map((arr) => arr.length));
    const result: any[][] = [];
    for (let i = 0; i < maxLen; i++) {
        result.push(arrays.map((arr) => arr[i]));
    }
    return result;
};

Array.range = function (start: number, end?: number, step = 1): number[] {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const result: number[] = [];
    if (step === 0) throw new Error('step must not be 0');
    const condition = step > 0 ? (i: number) => i < end! : (i: number) => i > end!;
    for (let i = start; condition(i); i += step) {
        result.push(i);
    }
    return result;
};

Array.repeat = function <T>(length: number, value: T | (() => T)): T[] {
    if (typeof length !== 'number' || !Number.isInteger(length) || length < 0) {
        throw new TypeError('Indices must be integers');
    }
    const result: T[] = [];
    for (let i = 0; i < length; i++) {
        result.push(typeof value === 'function' ? (value as () => T)() : value);
    }
    return result;
};
