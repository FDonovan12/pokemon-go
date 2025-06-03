export {};

declare global {
    interface Object {
        /**
         * Creates a deep clone of the object.
         * @returns A deep copy of the original object.
         */
        deepClone<T>(): T;

        /**
         * Deeply merges another object into the current object.
         * @param source - The object to merge from.
         * @returns The merged object (this).
         */
        deepMerge<T>(source: any): T | typeof source;

        /**
         * Checks for deep equality with another object.
         * @param other - The object to compare with.
         * @returns True if deeply equal, false otherwise.
         */
        deepEquals(other: unknown): boolean;
    }
}

const defineIfNotExists = (name: string, fn: Function) => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, name);
    if (!descriptor || descriptor.writable || descriptor.configurable) {
        Object.defineProperty(Object.prototype, name, {
            value: fn,
            enumerable: false,
            configurable: true,
            writable: true,
        });
    }
};

defineIfNotExists('deepClone', function (this: any) {
    return structuredClone(this);
});

defineIfNotExists('deepMerge', function (this: object, source: any) {
    if (typeof source !== 'object' || source === null) {
        throw new TypeError('Source must be a non-null object');
    }
    const isObject = (val: unknown): val is Record<string, any> =>
        val !== null && typeof val === 'object' && !Array.isArray(val);

    const merge = (target: any, source: any) => {
        for (const key of Object.keys(source)) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                merge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
        return target;
    };
    return merge(this.deepClone(), source);
});

defineIfNotExists('deepEquals', function (this: unknown, other: unknown): boolean {
    function eq(a: any, b: any): boolean {
        // Functions: always false (even if code is the same)
        if (typeof a === 'function' || typeof b === 'function') {
            return false;
        }
        // Type check
        if (typeof a !== typeof b) return false;

        if (a === b) {
            // +0 !== -0
            return a !== 0 || 1 / a === 1 / b;
        }

        // NaN === NaN
        if (Number.isNaN(a) && Number.isNaN(b)) {
            return true;
        }
        // Null check
        if (a === null || b === null) return a === b;
        // Array and object check
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        // Array check
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!eq(a[i], b[i])) return false;
            }
            return true;
        }
        // Object check
        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            // Check for undefined vs missing keys
            for (const key of aKeys) {
                if (!b.hasOwnProperty(key)) return false;
                if (!eq(a[key], b[key])) return false;
            }
            return true;
        }

        return false;
    }
    return eq(this, other);
});
