import { InjectionToken, Signal } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

export interface WithSearch {
    search: Signal<string>;
    generationSelected: Signal<number>;
    setSearch: (v: string) => void;
    clearSearch: () => void;
    selectGeneration: (v: number) => void;
    resultSelected: () => PokemonInterface[];
}
export const SEARCH_STORE = new InjectionToken<WithSearch>('SearchStore');
