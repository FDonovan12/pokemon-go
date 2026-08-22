import { signalStore, withMethods, withProps } from '@ngrx/signals';
import { localStorageSignal } from '@shared/utils/utils';
import { CardEntry, createEmptyCard } from '../stat-finder.types';

const STORAGE_KEY = 'stat-finder-cards';

export const StatFinderPageStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        cards: localStorageSignal(STORAGE_KEY, [] as CardEntry[]),
    })),
    withMethods((store) => ({
        addCard() {
            store.cards.update((previous) => [createEmptyCard(), ...previous]);
        },
        removeCard(id: string) {
            store.cards.update((previous) => previous.filter((c) => c.id !== id));
        },
        updateCard(id: string, partial: Partial<CardEntry>) {
            store.cards.update((previous) => previous.map((c) => (c.id === id ? { ...c, ...partial } : c)));
        },
        reorderCards(previousIndex: number, currentIndex: number) {
            store.cards.update((previous) => [...previous.swap(previousIndex, currentIndex)]);
        },
    })),
);
