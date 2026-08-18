import { computed } from '@angular/core';
import { generationsPokemon, PokemonData } from '@entities/pokemon';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';
import { withPokemonTextSearch } from './with-pokemon-text-search.feature';

const MAX_GENERATION = Math.max(...generationsPokemon);
const MIN_GENERATION = Math.min(...generationsPokemon);

export function withPokemonSearch<T extends PokemonData>() {
    return signalStoreFeature(
        withPokemonTextSearch<T>(),
        withState({ generationSelected: 1 }),
        withComputed((store) => ({
            resultSelected: computed((): T[] => {
                const search = store._debouncedSearch.value();
                if (search && search.trim() !== '') return store.searchResults();

                const allPokemons = store._allPokemons() ?? ([] as T[]);
                const onlyThisGeneration = allPokemons.filter(
                    (pokemon) => pokemon.generation === store.generationSelected(),
                );

                const hasMemberInThisGeneration = allPokemons
                    .groupBy('family')
                    .toList('values')
                    .filter((family) => family.some((pokemon) => pokemon.generation === store.generationSelected()))
                    .flat()
                    .filter((pokemon) => pokemon.generation !== store.generationSelected());

                const map = onlyThisGeneration.groupBy('family');
                hasMemberInThisGeneration.map((pokemon) => map.ensureArray(pokemon.family).push(pokemon));
                return map.toList('values').flat();
            }),
        })),
        withMethods((store) => ({
            decrementGeneration: () =>
                patchState(store, { generationSelected: Math.max(store.generationSelected() - 1, MIN_GENERATION) }),
            incrementGeneration: () =>
                patchState(store, { generationSelected: Math.min(store.generationSelected() + 1, MAX_GENERATION) }),
            selectGeneration: (generation: number) => patchState(store, { generationSelected: generation }),
        })),
    );
}
