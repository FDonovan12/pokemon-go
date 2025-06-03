import './string-prototype';

describe('String prototype extensions', () => {
    describe('capitalize', () => {
        it('should capitalize the first character', () => {
            expect('hello'.capitalize()).toBe('Hello');
            expect('Hello'.capitalize()).toBe('Hello');
            expect(''.capitalize()).toBe('');
        });
    });

    describe('splitWords', () => {
        it('should split camelCase, kebab-case, snake_case, and spaces', () => {
            expect('helloWorld'.splitWords()).toEqual(['hello', 'World']);
            expect('hello-world'.splitWords()).toEqual(['hello', 'world']);
            expect('hello_world'.splitWords()).toEqual(['hello', 'world']);
            expect('hello world'.splitWords()).toEqual(['hello', 'world']);
            expect('HTMLParser'.splitWords()).toEqual(['HTML', 'Parser']);
        });
    });

    describe('camelCase', () => {
        it('should convert to camelCase', () => {
            expect('hello world'.camelCase()).toBe('helloWorld');
            expect('Hello_world-test'.camelCase()).toBe('helloWorldTest');
            expect('helloWorldTest'.camelCase()).toBe('helloWorldTest');
        });
    });

    describe('kebabCase', () => {
        it('should convert to kebab-case', () => {
            expect('hello world'.kebabCase()).toBe('hello-world');
            expect('Hello_worldTest'.kebabCase()).toBe('hello-world-test');
            expect('hello-world-test'.kebabCase()).toBe('hello-world-test');
        });
    });

    describe('snakeCase', () => {
        it('should convert to snake_case', () => {
            expect('hello world'.snakeCase()).toBe('hello_world');
            expect('Hello-worldTest'.snakeCase()).toBe('hello_world_test');
            expect('hello_world_test'.snakeCase()).toBe('hello_world_test');
        });
    });

    describe('truncate', () => {
        it('should truncate and add ... if needed', () => {
            expect('hello world'.truncate(5)).toBe('hello...');
            expect('hello'.truncate(10)).toBe('hello');
        });
        it('should throw if n is not a non-negative integer', () => {
            expect(() => 'abc'.truncate(-1)).toThrowError(TypeError);
            expect(() => 'abc'.truncate(1.5)).toThrowError(TypeError);
            expect(() => 'abc'.truncate('a' as any)).toThrowError(TypeError);
        });
    });

    describe('reverse', () => {
        it('should reverse the string', () => {
            expect('abc'.reverse()).toBe('cba');
            expect('été'.reverse()).toBe('été');
        });
    });

    describe('isEmpty', () => {
        it('should return true for empty or whitespace strings', () => {
            expect(''.isEmpty()).toBe(true);
            expect('   '.isEmpty()).toBe(true);
        });
        it('should return false for non-empty strings', () => {
            expect('abc'.isEmpty()).toBe(false);
            expect(' a '.isEmpty()).toBe(false);
        });
    });

    describe('slugify', () => {
        it('should slugify a string', () => {
            expect('Hello World!'.slugify()).toBe('hello-world');
            expect("Éléphant à l'été".slugify()).toBe('elephant-a-l-ete');
            expect('  --Hello__World--  '.slugify()).toBe('hello-world');
        });
    });
});
