import { computed, debounced, inject } from '@angular/core';
import { PokemonData } from '@entities/pokemon';
import { patchState, signalStoreFeature, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';

const createInitialState = <T extends PokemonData>() => ({
    _allPokemons: [] as T[],
    search: '',
});

export function withPokemonTextSearch<T extends PokemonData>() {
    return signalStoreFeature(
        withProps(() => ({
            _internalListPokemonRepository: inject(InternalListPokemonRepository),
        })),
        withState(createInitialState<T>()),
        withProps((store) => ({
            _debouncedSearch: debounced(store.search, 300),
        })),
        withComputed((store) => ({
            searchResults: computed((): T[] => {
                const search = store._debouncedSearch.value();
                const allPokemons = store._allPokemons() ?? ([] as T[]);

                if (!search || search.trim() === '') return allPokemons;

                const internal = store._internalListPokemonRepository.getPokemonsForInternalListBySearch(search);
                if (internal) return internal as T[];

                const allFamily = allPokemons
                    .filter(
                        (pokemon) =>
                            pokemon.slug.slugifyIncludes(search) ||
                            pokemon.type.some((type) => type.slugifyEquals(search)),
                    )
                    .map((pokemon) => pokemon.family)
                    .toSet();

                return allPokemons
                    .filter((pokemon) => allFamily.has(pokemon.family))
                    .groupBy('family')
                    .toList('values')
                    .flat();
            }),
        })),
        withMethods((store) => ({
            setSearch: (value: string) => patchState(store, { search: value }),
            clearSearch: () => patchState(store, { search: '' }),
        })),
    );
}
