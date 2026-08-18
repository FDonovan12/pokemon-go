import { Injector, Signal, WritableSignal, effect, inject, signal } from '@angular/core';
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
