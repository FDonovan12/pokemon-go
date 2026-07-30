import { InjectionToken, Provider, Signal, Type } from '@angular/core';
import { PokemonData } from '@entities/pokemon';

export interface WithSearch<T extends PokemonData = PokemonData> {
    incrementGeneration(): void;
    decrementGeneration(): void;
    search: Signal<string>;
    generationSelected: Signal<number>;
    setSearch: (v: string) => void;
    clearSearch: () => void;
    selectGeneration: (v: number) => void;
    resultSelected: () => T[];
    filteredPokemons: () => T[];
}
export const SEARCH_STORE = new InjectionToken<WithSearch<any>>('SearchStore');

export function provideSearchStore(store: Type<WithSearch<any>>): Provider {
    return { provide: SEARCH_STORE, useExisting: store };
}
