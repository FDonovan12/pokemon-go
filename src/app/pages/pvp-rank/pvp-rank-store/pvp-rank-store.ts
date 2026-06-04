import { computed, effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from 'app/shared/features/pokemon-search/with-pokemon-search.feature';

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
    _allPokemons: [] as PokemonInterface[],
    allRank: new Map<PokemonSlug, PvpRank>(),
    generationSelected: 1,
    search: '',
};

export const PVPRankStore = signalStore(
    { providedIn: 'root' },
    withPokemonSearch(),
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
    })),
    withState(initialState),
    withComputed((store) => ({
        resultSelected: computed((): PokemonInterface[] => {
            return store.doSearch(store._allPokemons, store.search, store.generationSelected);
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
                _allPokemons: allPokemonsWithForms,
                allRank: map,
            });
        },
    })),
);
