import { computed, inject } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import { patchState, signalStoreFeature, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';

const initialState = {
    _allPokemons: [] as PokemonInterface[],
    generationSelected: 1,
    search: '',
};

export function withPokemonSearch() {
    return signalStoreFeature(
        withProps(() => ({
            _internalListPokemonRepository: inject(InternalListPokemonRepository),
        })),
        withState(initialState),
        withComputed((store) => ({
            resultSelected: computed((): PokemonInterface[] => {
                if (store.search()) {
                    const internal = store._internalListPokemonRepository.getPokemonsForInternalListBySearch(
                        store.search(),
                    );
                    if (internal) return internal;

                    const allFamily = store
                        ._allPokemons()
                        .filter(
                            (pokemon) =>
                                pokemon.slug.slugify().includes(store.search().slugify()) ||
                                pokemon.type.some((type) => type.slugifyEquals(store.search())),
                        )
                        .map((pokemon) => pokemon.family);

                    return store
                        ._allPokemons()
                        .filter((pokemon) => allFamily.includes(pokemon.family))
                        .groupBy('family')
                        .toList('values')
                        .flat();
                }

                const onlyThisGeneration = store
                    ._allPokemons()
                    .filter((pokemon) => pokemon.generation === store.generationSelected());

                const hasMemberInThisGeneration = store
                    ._allPokemons()
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
            setSearch: (value: string) => patchState(store, { search: value }),
            clearSearch: () => patchState(store, { search: '' }),
            selectGeneration: (generation: number) => patchState(store, { generationSelected: generation }),
        })),
    );
}
