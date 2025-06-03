export const defineIfNotExists = <T extends object>(prototype: T, name: string, fn: Function): void => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
    if (!descriptor || descriptor.writable || descriptor.configurable) {
        Object.defineProperty(prototype, name, {
            value: fn,
            enumerable: false,
            configurable: false,
            writable: false,
        });
    }
};
