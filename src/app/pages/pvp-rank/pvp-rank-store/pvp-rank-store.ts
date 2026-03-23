import { computed, effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';

const LOCAL_STORAGE_PVP_RANK = 'pokemon-pvp_rank';

export interface PvpRank {
    super: {
        obscur: number | null;
        normal: number | null;
    };
    hyper: {
        obscur: number | null;
        normal: number | null;
    };
}

const initialState = {
    allPokemon: [] as PokemonInterface[],
    allRank: new Map<PokemonSlug, PvpRank>(),
    generationSelected: 2,
    search: '',
};

export const PVPRankStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
    })),
    withState(initialState),
    withComputed((store) => ({
        resultSelected: computed(() => {
            let result = [];
            if (store.search()) {
                const allFamily = store
                    .allPokemon()
                    .filter((pokemon) => pokemon.slug.slugify().includes(store.search().slugify()))
                    .map((pokemon) => pokemon.family);
                result = store
                    .allPokemon()
                    .filter((pokemon) => allFamily.includes(pokemon.family))
                    .groupBy('family')
                    .toList('values')
                    .flat();
            } else {
                const onlyThisGeneration = store
                    .allPokemon()
                    .filter((pokemon) => pokemon.generation === store.generationSelected());

                const HasMemberInThisGeneration = store
                    .allPokemon()
                    .groupBy('family')
                    .toList('values')
                    .filter((family) => family.some((pokemon) => pokemon.generation === store.generationSelected()))
                    .flat()
                    .filter((pokemon) => pokemon.generation !== store.generationSelected());
                const map = onlyThisGeneration.groupBy('family');
                HasMemberInThisGeneration.map((pokemon) => map.ensureArray(pokemon.family).push(pokemon));
                result = map.toList('values').flat();
            }
            return result;
        }),
    })),
    withMethods((store) => ({
        _getOrInitRank(pokemon: PokemonSlug): PvpRank {
            const ranks = store.allRank();
            if (!ranks.has(pokemon)) {
                const initRank: PvpRank = {
                    super: { obscur: null, normal: null },
                    hyper: { obscur: null, normal: null },
                };
                ranks.set(pokemon, initRank);
            }
            return ranks.get(pokemon)!;
        },
        selectGeneration(generation: number) {
            patchState(store, { generationSelected: generation, search: '' });
        },
        setSearch: (value: string) => patchState(store, { search: value }),
    })),
    withMethods((store) => ({
        modifyRank(pokemon: PokemonSlug, newRank: number, league: 'super' | 'hyper', form: 'normal' | 'obscur') {
            const rank = store._getOrInitRank(pokemon);
            rank[league][form] = newRank;
            patchState(store, { allRank: new Map(store.allRank()) });
        },
    })),
    withHooks((store) => ({
        onInit() {
            effect(() => {
                const allRank = store.allRank().toObject();
                store._localStorageService.set(LOCAL_STORAGE_PVP_RANK, allRank);
            });

            const object = store._localStorageService.get(LOCAL_STORAGE_PVP_RANK, {});
            const map = new Map(Object.entries(object) as [PokemonSlug, PvpRank][]);
            const pokemonsByName = store._pokemonRepository.pokemonIndex.byName;
            const allPokemons = Object.values(pokemonsByName);
            const allPokemonsForms: PokemonInterface[] = allPokemons
                .map((pokemon) => pokemon.alternatives)
                .compact()
                .map((pokemon) =>
                    [
                        pokemon?.Alola,
                        pokemon?.Crowned,
                        pokemon?.Galar,
                        pokemon?.Hisui,
                        pokemon?.['Rapid-strike'],
                    ].compact(),
                )
                .flat()
                .map((pokemon) => ({
                    ...pokemon,
                    slug: pokemon?.name + '-' + pokemon?.slug,
                    family: allPokemons.find((pok) => pok.name === pokemon?.name)?.family,
                    generation: allPokemons.find((pok) => pok.name === pokemon?.name)?.generation,
                    id: allPokemons.find((pok) => pok.name === pokemon?.name)?.id,
                })) as PokemonInterface[];
            const allPokemonsWithForms = allPokemons.concat(allPokemonsForms).sortAsc((pokemon) => pokemon.id);

            patchState(store, {
                allPokemon: allPokemonsWithForms,
                allRank: map,
            });
        },
    })),
);
