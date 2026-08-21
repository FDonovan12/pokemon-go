import { Signal, computed } from '@angular/core';

// lookup.util.ts

export interface Lookup<K, V> {
    get: (key: K) => V | undefined;
    getMany: (keys: K[]) => V[];
    getAll: () => V[];
    asMap: Signal<Map<K, V>>;
}

// -- seul endroit à modifier pour ajouter une méthode à TOUS les lookups --
function createLookupFromEntries<K, V>(entries: Signal<[K, V][]>): Lookup<K, V> {
    const byKey = computed(() => new Map(entries()));
    return {
        get: (key) => byKey().get(key),
        getMany: (keys) => keys.map((key) => byKey().get(key)).compact(),
        getAll: () => byKey().toList('values'),
        asMap: byKey,
    };
}

// createLookup — réindexe sans transformer
export function createLookup<T, K>(source: Signal<Iterable<T>>, keyFn: (item: T) => K): Lookup<K, T>;
export function createLookup<K, V>(source: Signal<Map<K, V>>): Lookup<K, V>;
export function createLookup<K extends string | number, V>(source: Signal<Record<K, V> | undefined>): Lookup<K, V>;
export function createLookup(source: Signal<any>, keyFn?: (item: any) => any): Lookup<any, any> {
    return keyFn ? computeByKey(source, keyFn, (item) => item) : computeByKey(source, (item: any) => item);
}

// computeByKey — réindexe ET transforme
export function computeByKey<T, K, R>(
    source: Signal<Iterable<T>>,
    keyFn: (item: T) => K,
    compute: (item: T) => R,
): Lookup<K, R>;
export function computeByKey<K, T, R>(source: Signal<Map<K, T>>, compute: (item: T, key: K) => R): Lookup<K, R>;
export function computeByKey<K extends string | number, T, R>(
    source: Signal<Record<K, T> | undefined>,
    compute: (item: T, key: K) => R,
): Lookup<K, R>;

export function computeByKey(source: Signal<any>, keyFnOrCompute: any, maybeCompute?: any): Lookup<any, any> {
    if (maybeCompute) {
        return computeIterableByKey(source, keyFnOrCompute, maybeCompute);
    }
    return computeIndexedByKey(source, keyFnOrCompute);
}
function computeIterableByKey<T, K, R>(
    items: Signal<Iterable<T>>,
    keyFn: (item: T) => K,
    compute: (item: T) => R,
): Lookup<K, R> {
    const entries = computed<[K, R][]>(() => {
        const result: [K, R][] = [];
        for (const item of items()) result.push([keyFn(item), compute(item)]);
        return result;
    });
    return createLookupFromEntries(entries);
}

function computeIndexedByKey<K, T, R>(
    source: Signal<Map<K, T> | Record<any, T> | undefined>,
    compute: (item: T, key: K) => R,
): Lookup<K, R> {
    const entries = computed<[K, R][]>(() => {
        const value = source();
        if (value == null) return [];
        const rawEntries: [K, T][] = value instanceof Map ? [...value] : (Object.entries(value) as [K, T][]);
        return rawEntries.map(([key, item]) => [key, compute(item, key)]);
    });
    return createLookupFromEntries(entries);
}
