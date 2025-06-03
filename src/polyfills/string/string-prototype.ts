import { defineIfNotExists } from 'polyfills/utils';

export {};

declare global {
    interface String {
        /**
         * Capitalizes the first character of the string.
         * @returns A new string with the first character in uppercase.
         */
        capitalize(): string;

        /**
         * Splits the string into an array of words, detecting camelCase, kebab-case, snake_case, and spaces.
         * @returns An array of words extracted from the string.
         */
        splitWords(): string[];

        /**
         * Converts the string to camelCase.
         * @returns A camelCased version of the string.
         */
        camelCase(): string;

        /**
         * Converts the string to kebab-case.
         * @returns A kebab-cased version of the string.
         */
        kebabCase(): string;

        /**
         * Converts the string to snake_case.
         * @returns A snake_cased version of the string.
         */
        snakeCase(): string;

        /**
         * Truncates the string to a maximum number of characters, appending '...' if truncated.
         * @param n - Maximum length of the string.
         * @returns A truncated string.
         */
        truncate(n: number): string;

        /**
         * Reverses the characters in the string.
         * @returns The reversed string.
         */
        reverse(): string;

        /**
         * Checks if the string is empty or contains only whitespace.
         * @returns `true` if the string is empty or whitespace only, `false` otherwise.
         */
        isEmpty(): boolean;

        /**
         * Converts the string into a slug usable in URLs.
         * @returns A slugified version of the string.
         */
        slugify(): string;
    }
}

defineIfNotExists(String.prototype, 'splitWords', function (this: string): string[] {
    return this.replace(/([a-z0-9])([A-Z])/g, '$1 $2') // helloWorld → hello World
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // HTMLParser → HTML Parser
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
});

defineIfNotExists(String.prototype, 'camelCase', function (this: string): string {
    const words = this.splitWords().map((w: string) => w.toLowerCase());
    return words
        .map((word: string, i: number) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('');
});

defineIfNotExists(String.prototype, 'kebabCase', function (this: string): string {
    return this.splitWords()
        .map((w: string) => w.toLowerCase())
        .join('-');
});

defineIfNotExists(String.prototype, 'snakeCase', function (this: string): string {
    return this.splitWords()
        .map((w: string) => w.toLowerCase())
        .join('_');
});

defineIfNotExists(String.prototype, 'truncate', function (this: string, n: number): string {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
        throw new TypeError('Truncate length must be a non-negative integer');
    }
    return this.length > n ? this.slice(0, n) + '...' : this.toString();
});

defineIfNotExists(String.prototype, 'reverse', function (this: string): string {
    return [...this].reverse().join('');
});

defineIfNotExists(String.prototype, 'isEmpty', function (this: string): boolean {
    return this.trim().length === 0;
});

defineIfNotExists(String.prototype, 'slugify', function (this: string): string {
    return this.normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
});

defineIfNotExists(String.prototype, 'capitalize', function (this: string): string {
    if (this.length === 0) return '';
    return this.charAt(0).toUpperCase() + this.slice(1);
});
