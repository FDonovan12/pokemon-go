import { Injector, Signal, WritableSignal, effect, inject, runInInjectionContext, signal } from '@angular/core';
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
    const run = () => {
        const localStorageService = inject(LocalStorageService);
        effect(() => {
            localStorageService.set(key, source());
        });
    };

    if (injector) {
        runInInjectionContext(injector, run);
    } else {
        run(); // suppose qu'on est déjà dans un contexte d'injection valide
    }
}

// localStorageSignal (standalone) devient juste une composition des deux :
export function localStorageSignal<T>(key: string, defaultValue: T, reviver?: (value: T) => T): WritableSignal<T> {
    const localStorageService = inject(LocalStorageService);
    const stored = localStorageService.get(key, defaultValue);
    const initial = reviver ? reviver(stored) : stored;
    const state = signal<T>(initial);

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
