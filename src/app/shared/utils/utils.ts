import { Injector, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';

export function createTimer(label: string) {
    const start = performance.now();
    let last = start;

    return (checkpoint: string) => {
        const now = performance.now();
        console.log(`[${label}] ${checkpoint}: +${(now - last).toFixed(2)}ms (total: ${(now - start).toFixed(2)}ms)`);
        last = now;
    };
}

export function persistToLocalStorage<T>(key: string, source: Signal<T>, injector?: Injector): void {
    const localStorageService = inject(LocalStorageService);
    effect(
        () => {
            localStorageService.set(key, source());
        },
        injector ? { injector } : undefined,
    );
}

// localStorageSignal (standalone) devient juste une composition des deux :
export function localStorageSignal<T>(key: string, defaultValue: T): WritableSignal<T> {
    const localStorageService = inject(LocalStorageService);
    const state = signal<T>(localStorageService.get(key, defaultValue));

    persistToLocalStorage(key, state);

    return state;
}

export function createExpandableSet<K>() {
    const expandedKeys = signal<Set<K>>(new Set());

    return {
        expandedKeys: expandedKeys.asReadonly(),
        isExpanded: (key: K) => expandedKeys().has(key),
        toggle: (key: K) => {
            expandedKeys.update((set) => {
                const next = new Set(set);
                next.has(key) ? next.delete(key) : next.add(key);
                return next;
            });
        },
    };
}

export function createLookupByKey<T, K>(items: Signal<T[]>, keyFn: (item: T) => K) {
    const byKey = computed(() => new Map(items().map((item) => [keyFn(item), item])));

    return {
        get: (key: K): T | undefined => byKey().get(key),
        getMany: (keys: K[]): T[] => {
            const map = byKey();
            return keys.map((key) => map.get(key)).compact();
        },
    };
}

export function createLookupBySlug<T extends { slug: string }>(items: Signal<T[]>) {
    return createLookupByKey(items, (item) => item.slug);
}
