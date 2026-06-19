import { effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from '@shared/features/pokemon-search/with-pokemon-search.feature';

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
    allRank: new Map<PokemonSlug, PvpRank>(),
};

export const PVPRankStore = signalStore(
    { providedIn: 'root' },
    withPokemonSearch(),
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
    })),
    withState(initialState),
    withComputed((store) => ({})),
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
        removeRank(pokemon: PokemonSlug, league: 'super' | 'hyper', form: 'normal' | 'obscur') {
            const rank = store._getOrInitRank(pokemon);
            rank[league][form] = null;
            patchState(store, { allRank: new Map(store.allRank()) });
        },
        getRankPokemon(pokemon: PokemonSlug, league: 'super' | 'hyper', form: 'normal' | 'obscur'): number | null {
            const rank = store._getOrInitRank(pokemon);
            return rank[league][form];
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
                    slug: (pokemon?.name + '-' + pokemon?.slug) as PokemonSlug,
                    family: allPokemons.find((pok) => pok.name === pokemon?.name)!.family,
                    generation: allPokemons.find((pok) => pok.name === pokemon?.name)!.generation,
                }));
            const allPokemonsWithForms = allPokemons.concat(allPokemonsForms).sortAsc((pokemon) => pokemon.id);
            console.log(store._pokemonRepository.getPokemonByName(allPokemonsWithForms[0].name));
            patchState(store, {
                _allPokemons: allPokemonsWithForms,
                allRank: map,
            });
        },
    })),
);
