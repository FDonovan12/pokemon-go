import { computed, effect, inject, resource } from '@angular/core';
import { Base, LeagueStats, PokemonInterface, PokemonSlug, RankPVP } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { PvpRankRepository } from '@repositories/pvp-rank-repository/pvp-rank.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from '@shared/features/pokemon-search/with-pokemon-search.feature';
import { League } from './../pvp-rank.type';

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
        _pvpRankRepository: inject(PvpRankRepository),
    })),
    withProps((store) => ({
        _pokemonsResource: resource({
            params: () => store._pokemonRepository.pokemonsSetting.value(),
            loader: async ({ params: pokemons }) => {
                return pokemons
                    .map((form) => [form.base, ...form.different.map((d) => d.base)])
                    .flat() as any as PokemonInterface[];
            },
            defaultValue: [],
        }),
        _rank1PVP: resource({
            params: () => store._pokemonRepository.rank1PVP.value(),
            loader: async ({ params: pokemons }) => {
                return pokemons;
            },
            defaultValue: {} as Record<PokemonSlug, RankPVP>,
        }),
    })),
    withProps((store) => ({
        _filteredResource: resource({
            params: () => {
                const table = store._pokemonRepository.cpMultiplier.value();
                const pokemons = store.resultSelected();
                if (!table || !pokemons.length) return undefined;
                return { table, pokemons };
            },
            loader: async ({ params: { table, pokemons } }) => {
                const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
                return pokemons.filter(
                    (pokemon) =>
                        store._pokemonRepository.pureCalculateCp(pokemon as any as Base, table, IV_MAX, 50) > 1480,
                );
            },
            defaultValue: [],
        }),
    })),
    withState(initialState),
    withComputed((store) => ({
        isLoading: computed(() => store._pokemonsResource.isLoading() || store._filteredResource.isLoading()),
        filteredPokemons: computed(() =>
            store._filteredResource.isLoading()
                ? store.resultSelected()
                : (store._filteredResource.value() ?? store.resultSelected()),
        ),
    })),
    withComputed((store) => ({
        rank1Filter: computed(() => {
            const mapFilterGreat = new Map<string, Base[]>();
            const mapFilterUltra = new Map<string, Base[]>();
            const rank = store._rank1PVP.value();
            function ivToFilterValue(iv: number): number {
                if (iv === 0) return 0;
                if (iv <= 5) return 1;
                if (iv <= 10) return 2;
                if (iv <= 14) return 3;
                return 4;
            }
            const statToFilterNumber = (stats: LeagueStats) => ({
                atq: ivToFilterValue(stats.atk),
                def: ivToFilterValue(stats.def),
                stamina: ivToFilterValue(stats.sta),
            });
            store.filteredPokemons().forEach((pokemon) => {
                const base = pokemon as any as Base;
                const test = rank[pokemon.slug]?.great;
                const statGreat = statToFilterNumber(rank[pokemon.slug]?.great);
                mapFilterGreat.ensureArray(statGreat.stableStringify()).push(base);

                const table = store._pokemonRepository.cpMultiplier.value();
                const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
                if (
                    table &&
                    store._pokemonRepository.pureCalculateCp(pokemon as any as Base, table, IV_MAX, 50) > 2480
                ) {
                    const statHyper = statToFilterNumber(rank[pokemon.slug].ultra);
                    mapFilterUltra.ensureArray(statHyper.stableStringify()).push(base);
                }
            });

            const setGreat = new Set<number>();
            const setUltra = new Set<number>();
            const getAllEvolutionIds = (pokemon: Base): string[] => {
                const directEvos = pokemon.evolutionIds ?? [];
                return [
                    ...directEvos,
                    ...directEvos.flatMap((evoId) => {
                        const evo = store._pokemonsResource.value().find((p: any) => p.pokemonId === evoId);
                        return evo ? getAllEvolutionIds(evo as any as Base) : [];
                    }),
                ];
            };

            const subEvolutions = (mainPokemon: Base) => {
                const allEvoIds = getAllEvolutionIds(mainPokemon);
                return store._pokemonsResource
                    .value()
                    .filter(
                        (otherPokemon: any) =>
                            otherPokemon.family === mainPokemon.family && !allEvoIds.includes(otherPokemon.pokemonId),
                    );
            };
            // const subEvolutions = (mainPokemon: Base) =>
            //     store._pokemonsResource
            //         .value()
            //         .filter(
            //             (otherPokemon: any) =>
            //                 otherPokemon.family === mainPokemon.family &&
            //                 !mainPokemon?.evolutionIds?.includes(otherPokemon.pokemonId),
            //         );
            const toFilterList = (map: Map<string, Base[]>, league: League) =>
                [...map.entries()]
                    .map(([key, pokemons]) => {
                        const stats = JSON.parse(key) as { atq: number; def: number; stamina: number };
                        const dexNumbers = new Set(
                            pokemons
                                .filter(
                                    (mainPokemon) =>
                                        (store.allRank().get(mainPokemon.slug)?.[league]?.normal ?? 0) !== 1,
                                )
                                .flatMap(subEvolutions),
                        ).toList();
                        return {
                            stats,
                            pokemons: dexNumbers as any as Base[],
                            count: pokemons.length,
                            dexNumbers,
                            isIncluded: true,
                        };
                    })
                    .sortDesc('count');
            const test = store._pokemonRepository.preEvolutionMap();
            return {
                great: toFilterList(mapFilterGreat, 'super'),
                ultra: toFilterList(mapFilterUltra, 'hyper'),
                allPokemon: [...new Set(store.filteredPokemons().flatMap((p) => subEvolutions(p as any as Base)))]
                    .map((p) => (p as any).dexNumber)
                    .join(','),
            };
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
            const nexRank = new Map(store.allRank());
            console.log(nexRank);
            patchState(store, { allRank: nexRank });
            store._pvpRankRepository.save(store.allRank());
        },
        removeRank(pokemon: PokemonSlug, league: 'super' | 'hyper', form: 'normal' | 'obscur') {
            const rank = store._getOrInitRank(pokemon);
            rank[league][form] = null;
            patchState(store, { allRank: new Map(store.allRank()) });
            store._pvpRankRepository.save(store.allRank());
        },
        getRankPokemon(pokemon: PokemonSlug, league: 'super' | 'hyper', form: 'normal' | 'obscur'): number | null {
            const rank = store._getOrInitRank(pokemon);
            return rank[league][form];
        },
    })),
    withHooks((store) => ({
        onInit() {
            effect(() => {
                const pokemons = store._pokemonsResource.value();
                if (pokemons) patchState(store, { _allPokemons: pokemons });
            });

            // effect(() => {
            //     console.log('save effect');
            //     // if (!store._filteredResource.isLoading()) return;
            // });

            store._pvpRankRepository.load().then((data) => patchState(store, { allRank: data }));
            // await after the effect for injection context
        },
    })),
);
