import { inject, Signal } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import { patchState, signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';

export function withPokemonSearch() {
    return signalStoreFeature(
        withProps(() => ({
            _internalListPokemonRepository: inject(InternalListPokemonRepository),
        })),
        withMethods((store) => ({
            doSearch: (
                allPokemon: Signal<PokemonInterface[]>,
                search: Signal<string>,
                generationSelected: Signal<number>,
            ) => {
                if (search()) {
                    const internal = store._internalListPokemonRepository.getPokemonsForInternalListBySearch(search());
                    if (internal) return internal;

                    const allFamily = allPokemon()
                        .filter(
                            (pokemon) =>
                                pokemon.slug.slugify().includes(search().slugify()) ||
                                pokemon.type.some((type) => type.slugifyEquals(search())),
                        )
                        .map((pokemon) => pokemon.family);

                    return allPokemon()
                        .filter((pokemon) => allFamily.includes(pokemon.family))
                        .groupBy('family')
                        .toList('values')
                        .flat();
                }

                const onlyThisGeneration = allPokemon().filter(
                    (pokemon) => pokemon.generation === generationSelected(),
                );

                const hasMemberInThisGeneration = allPokemon()
                    .groupBy('family')
                    .toList('values')
                    .filter((family) => family.some((pokemon) => pokemon.generation === generationSelected()))
                    .flat()
                    .filter((pokemon) => pokemon.generation !== generationSelected());

                const map = onlyThisGeneration.groupBy('family');
                hasMemberInThisGeneration.map((pokemon) => map.ensureArray(pokemon.family).push(pokemon));
                return map.toList('values').flat();
            },
            setSearch: (value: string) => patchState(store, { search: value }),
            clearSearch: () => patchState(store, { search: '' }),
            selectGeneration: (generation: number) => patchState(store, { generationSelected: generation }),
        })),
    );
}
