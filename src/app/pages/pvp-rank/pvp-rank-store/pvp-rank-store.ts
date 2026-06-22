import { effect, inject, resource } from '@angular/core';
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
    withProps((store) => ({
        _filteredResource: resource({
            params: () => {
                const table = store._pokemonRepository.cpMultiplier.value();
                const pokemons = store._pokemonRepository.pokemonsSetting.value();
                if (!table || !pokemons) return undefined;
                return { table, pokemons };
            },
            loader: async ({ params }) => {
                const { table, pokemons } = params;
                const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
                return pokemons
                    .map((form) => [form.base, ...form.different.map((d) => d.base)])
                    .flat()
                    .filter((pokemon) => store._pokemonRepository.pureCalculateCp(pokemon, table, IV_MAX, 50) > 1480);
            },
        }),
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
        async onInit() {
            effect(() => {
                const pokemons = store._filteredResource.value();
                if (pokemons) patchState(store, { _allPokemons: pokemons as any as PokemonInterface[] });
            });

            // Chargement localStorage
            const object = store._localStorageService.get(LOCAL_STORAGE_PVP_RANK, {});
            const map = new Map(Object.entries(object) as [PokemonSlug, PvpRank][]);
            patchState(store, { allRank: map });

            // Persistence
            effect(() => {
                if (!store._filteredResource.isLoading()) return;
                store._localStorageService.set(LOCAL_STORAGE_PVP_RANK, store.allRank().toObject());
            });
        },
    })),
);
