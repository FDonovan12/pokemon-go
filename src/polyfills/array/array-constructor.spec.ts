import './array-constructor';

describe('Array Constructor extensions', () => {
    describe('range', () => {
        it('should generate a range from 0 to n-1 if only start is given', () => {
            expect(Array.range(5)).toEqual([0, 1, 2, 3, 4]);
        });

        it('should generate a range from start to end-1', () => {
            expect(Array.range(2, 6)).toEqual([2, 3, 4, 5]);
        });

        it('should support negative steps', () => {
            expect(Array.range(5, 1, -1)).toEqual([5, 4, 3, 2]);
        });

        it('should throw if step is 0', () => {
            expect(() => Array.range(0, 5, 0)).toThrowError('step must not be 0');
        });

        it('should return an empty array if start equals end', () => {
            expect(Array.range(3, 3)).toEqual([]);
        });

        it('should return an empty array if step does not reach end', () => {
            expect(Array.range(0, 5, -1)).toEqual([]);
            expect(Array.range(5, 0, 1)).toEqual([]);
        });
    });

    describe('repeat', () => {
        it('should fill an array with the same value', () => {
            expect(Array.repeat(3, 'a')).toEqual(['a', 'a', 'a']);
        });

        it('should fill an array with values from a function', () => {
            let n = 0;
            expect(Array.repeat(4, () => ++n)).toEqual([1, 2, 3, 4]);
        });

        it('should return an empty array if length is 0', () => {
            expect(Array.repeat(0, 'x')).toEqual([]);
        });

        it('should throw if length is negative or not an integer', () => {
            expect(() => Array.repeat(-1, 'a')).toThrowError();
            expect(() => Array.repeat(1.5, 'a')).toThrowError();
            expect(() => Array.repeat('a' as any, 'a')).toThrowError();
        });
    });

    describe('zip', () => {
        it('should zip two arrays of equal length', () => {
            expect(Array.zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([
                [1, 'a'],
                [2, 'b'],
                [3, 'c'],
            ]);
        });

        it('should zip arrays of different lengths (fill with undefined)', () => {
            expect(Array.zip([1, 2], ['a', 'b', 'c'], [true, false, true])).toEqual([
                [1, 'a', true],
                [2, 'b', false],
                [undefined, 'c', true],
            ]);
        });

        it('should return an empty array if no arrays are given', () => {
            expect(Array.zip()).toEqual([]);
        });

        it('should return an array of undefineds if all arrays are empty', () => {
            expect(Array.zip([], [])).toEqual([]);
        });

        it('should work with a single array', () => {
            expect(Array.zip([1, 2, 3])).toEqual([[1], [2], [3]]);
        });

        it('should fill with undefined for missing elements', () => {
            expect(Array.zip([1], [2, 3, 4])).toEqual([
                [1, 2],
                [undefined, 3],
                [undefined, 4],
            ]);
        });
    });
});
