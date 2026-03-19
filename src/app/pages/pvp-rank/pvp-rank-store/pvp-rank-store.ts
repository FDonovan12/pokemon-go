import { computed, effect, inject } from '@angular/core';
import { PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';

const LOCAL_STORAGE_PVP_RANK = 'pokemon-pvp_rank';

interface PvpRank {
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
    generationSelected: 1,
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
            if (store.search()) {
                const allFamily = store
                    .allPokemon()
                    .filter((pokemon) => pokemon.slug.slugify().includes(store.search().slugify()))
                    .map((pokemon) => pokemon.family);
                return store.allPokemon().filter((pokemon) => allFamily.includes(pokemon.family));
            }
            return store.allPokemon().filter((pokemon) => pokemon.generation === store.generationSelected());
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
            patchState(store, { generationSelected: generation });
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
            console.log(object);
            const map = new Map(Object.entries(object) as [PokemonSlug, PvpRank][]);
            const pokemonsByName = store._pokemonRepository.pokemonIndex.byName;
            const allPokemons = Object.values(pokemonsByName);
            patchState(store, {
                allPokemon: allPokemons,
                allRank: map,
            });
        },
    })),
);
