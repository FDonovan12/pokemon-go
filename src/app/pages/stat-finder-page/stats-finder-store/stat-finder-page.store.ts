import { effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { CardEntry, createEmptyCard } from '../stat-finder.types';

const STORAGE_KEY = 'stat-finder-cards';

export const StatFinderPageStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _localStorageService: inject(LocalStorageService),
    })),
    withState<{ cards: CardEntry[] }>({ cards: [] }),
    withMethods((store) => ({
        addCard() {
            patchState(store, { cards: [...store.cards(), createEmptyCard()] });
        },
        removeCard(id: string) {
            patchState(store, { cards: store.cards().filter((c) => c.id !== id) });
        },
        updateCard(id: string, partial: Partial<CardEntry>) {
            patchState(store, {
                cards: store.cards().map((c) => (c.id === id ? { ...c, ...partial } : c)),
            });
        },
    })),
    withHooks({
        onInit(store) {
            const saved = store._localStorageService.get(STORAGE_KEY, [] as CardEntry[]);
            patchState(store, { cards: saved });
            effect(() => store._localStorageService.set(STORAGE_KEY, store.cards()));
        },
    }),
);
