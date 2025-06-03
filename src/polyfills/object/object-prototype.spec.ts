import './object-prototype';

describe('Object.prototype extensions', () => {
    describe('deepClone', () => {
        it('should deeply clone a plain object', () => {
            const obj = { a: 1, b: { c: 2 } };
            const clone = structuredClone(obj);
            expect(clone).toEqual(obj);
            expect(clone).not.toBe(obj);
            expect(clone.b).not.toBe(obj.b);
        });

        it('should deeply clone an array', () => {
            const arr = [{ a: 1 }, { b: 2 }];
            const clone = arr.deepClone<typeof arr>();
            expect(clone).toEqual(arr);
            expect(clone).not.toBe(arr);
            expect(clone[0]).not.toBe(arr[0]);
        });
    });

    describe('deepMerge', () => {
        it('should deeply merge two objects', () => {
            const obj = { a: 1, b: { c: 2 } };
            const source = { b: { d: 3 }, e: 4 };
            const merged = obj.deepMerge<typeof obj>(source);
            expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
            console.log(merged);
        });

        it('should overwrite primitive values', () => {
            const obj = { a: 1, b: 2 };
            const merged = obj.deepMerge({ b: 3 });
            expect(merged).toEqual({ a: 1, b: 3 });
            console.log(merged);
        });

        it('should throw if source is not an object', () => {
            expect(() => (({}) as any).deepMerge(null)).toThrowError(TypeError);
            expect(() => (({}) as any).deepMerge(42 as any)).toThrowError(TypeError);
        });
    });

    describe('Object.prototype polyfills - deepEquals', () => {
        it('should return true for objects with same keys and values, regardless of key order', () => {
            expect({ a: 2, b: 3 }.deepEquals({ b: 3, a: 2 })).toBe(true);
            expect({ a: 2, b: { c: 4 } }.deepEquals({ b: { c: 4 }, a: 2 })).toBe(true);
        });

        it('should return false for objects with different values', () => {
            expect({ a: 2, b: 3 }.deepEquals({ a: 2, b: 4 })).toBe(false);
            expect({ a: 2, b: { c: 4 } }.deepEquals({ a: 2, b: { c: 5 } })).toBe(false);
        });

        it('should return true for arrays with same elements in same order', () => {
            expect([1, 2, 3].deepEquals([1, 2, 3])).toBe(true);
            expect([1, [2, 3]].deepEquals([1, [2, 3]])).toBe(true);
        });

        it('should return false for arrays with different elements or order', () => {
            expect([1, 2, 3].deepEquals([1, 3, 2])).toBe(false);
            expect([1, [2, 3]].deepEquals([1, [3, 2]])).toBe(false);
        });

        it('should return false for objects with different keys', () => {
            expect({ a: 2 }.deepEquals({ b: 2 })).toBe(false);
        });

        it('should return true for empty arrays and objects', () => {
            expect([].deepEquals([])).toBe(true);
            expect({}.deepEquals({})).toBe(true);
        });

        it('should return false for array vs object', () => {
            expect([].deepEquals({})).toBe(false);
            expect({}.deepEquals([])).toBe(false);
        });

        it('should return false for different lengths', () => {
            expect([1].deepEquals([1, 2])).toBe(false);
            expect({ a: 1 }.deepEquals({ a: 1, b: 2 })).toBe(false);
        });

        it('should return true for NaN deepEquals NaN', () => {
            expect({ a: NaN }.deepEquals({ a: NaN })).toBe(true);
            expect([NaN].deepEquals([NaN])).toBe(true);
        });

        it('should return false for +0 and -0', () => {
            expect({ a: +0 }.deepEquals({ a: -0 })).toBe(false);
            expect([+0].deepEquals([-0])).toBe(false);
        });

        it('should return false for objects with undefined vs missing keys', () => {
            expect({ a: undefined }.deepEquals({})).toBe(false);
            expect({}.deepEquals({ a: undefined })).toBe(false);
        });

        it('should return false for objects with functions, even if functions are equal', () => {
            expect({ a: () => 1 }.deepEquals({ a: () => 1 })).toBe(false);
        });

        it('should return true for nested structures deeply equal', () => {
            expect({ a: [1, { b: 2 }] }.deepEquals({ a: [1, { b: 2 }] })).toBe(true);
        });

        it('should return false for nested structures not deeply equal', () => {
            expect({ a: [1, { b: 2 }] }.deepEquals({ a: [1, { b: 3 }] })).toBe(false);
        });
    });
});
