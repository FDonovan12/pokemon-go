import { computed, effect, inject, resource } from '@angular/core';
import { Base, LeagueStats, PokemonInterface, PokemonSlug, RankPVP } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { PvpRankRepository } from '@repositories/pvp-rank-repository/pvp-rank.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from '@shared/features/pokemon-search/with-pokemon-search.feature';
import { createTimer } from '@shared/utils/utils';
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
        _filterService: inject(FilterService),
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
        _subEvolutionsMap: computed(() => buildSubEvolutionsMap(store._pokemonsResource.value() as any as Base[])),
    })),
    withProps((store) => ({
        _rankPVP: resource({
            params: () => {
                if (store._filteredResource.isLoading()) return undefined;
                return store.filteredPokemons().map((p) => p.slug);
            },
            loader: async ({ params: slugs }) => {
                const entries = await Promise.all(
                    slugs.map(async (slug) => {
                        const data = await store._pokemonRepository.getPVPRank(slug);
                        return [slug, data] as const;
                    }),
                );
                return new Map(entries);
            },
            // defaultValue: {} as Record<PokemonSlug, AllRankPVP>,
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
        _getBetterRankWithLimit(slug: PokemonSlug, league: League, limit = 4096): LeagueStats[] {
            const dataBestRankPVP = store._rankPVP.value();
            if (!dataBestRankPVP) return [];

            const allRank = dataBestRankPVP.get(slug);
            if (!allRank) return [];

            const ranks = store.allRank();
            const mapLeague = { super: 'great', hyper: 'ultra' } as const;

            const rank = Math.min(ranks.get(slug)?.[league]?.normal ?? limit, limit) - 1;
            return allRank[mapLeague[league]].slice(0, rank);
        },
    })),
    withComputed((store) => ({
        allRankFilter: computed(() => {
            const tick = createTimer('allRankFilter');
            const mapFilterGreat = new Map<number, Base[]>();
            const mapFilterUltra = new Map<number, Base[]>();
            const rank = store._rankPVP.value();
            if (!rank) return { great: [], ultra: [], allPokemon: '' };
            tick('setup + rank value');
            const subEvolutionsMap = store._subEvolutionsMap();
            tick('subEvolutionsMap');
            function ivToFilterValue(iv: number): number {
                if (iv === 0) return 0;
                if (iv <= 5) return 1;
                if (iv <= 10) return 2;
                if (iv <= 14) return 3;
                return 4;
            }
            const statToFilterKey = (stats: LeagueStats): number => {
                const atq = ivToFilterValue(stats.atk);
                const def = ivToFilterValue(stats.def);
                const sta = ivToFilterValue(stats.sta);
                return atq * 25 + def * 5 + sta; // encodage en base 5, unique entre 0 et 124
            };
            const decodeFilterKey = (key: number) => ({
                atq: Math.floor(key / 25),
                def: Math.floor(key / 5) % 5,
                stamina: key % 5,
            });
            store.filteredPokemons().forEach((pokemon) => {
                const base = pokemon as any as Base;
                const greatRankBetterThanActualRank = store._getBetterRankWithLimit(base.slug, 'super');
                const statsGreat = greatRankBetterThanActualRank;
                statsGreat?.forEach((stat) => mapFilterGreat.ensureArray(statToFilterKey(stat)).push(base));

                const table = store._pokemonRepository.cpMultiplier.value();
                const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
                if (
                    table &&
                    store._pokemonRepository.pureCalculateCp(pokemon as any as Base, table, IV_MAX, 50) > 2480
                ) {
                    const ultraRankBetterThanActualRank = store._getBetterRankWithLimit(base.slug, 'hyper');
                    const statHyper = ultraRankBetterThanActualRank;
                    statHyper?.forEach((stat) => mapFilterUltra.ensureArray(statToFilterKey(stat)).push(base));
                }
            });
            tick('build maps (forEach principal)');

            const toFilterList = (map: Map<number, Base[]>, league: League) =>
                [...map.entries()]
                    .map(([key, pokemons]) => {
                        const stats = decodeFilterKey(key) as { atq: number; def: number; stamina: number };
                        const uniquePokemon = pokemons.unique();
                        const dexNumbers = new Set(
                            uniquePokemon
                                .filter(
                                    (mainPokemon) =>
                                        (store.allRank().get(mainPokemon.slug)?.[league]?.normal ?? 0) !== 1,
                                )
                                .flatMap((mainPokemon) => subEvolutionsMap.get(mainPokemon.slug) ?? []),
                        ).toList();
                        return {
                            stats,
                            pokemons: dexNumbers as any as Base[],
                            count: uniquePokemon.length,
                            dexNumbers,
                            isIncluded: true,
                        };
                    })
                    .sortDesc('count');

            const greatList = toFilterList(mapFilterGreat, 'super');
            tick('toFilterList great');

            const ultraList = toFilterList(mapFilterUltra, 'hyper');
            tick('toFilterList ultra');

            const allPokemon = [
                ...new Set(store.filteredPokemons().flatMap((p) => subEvolutionsMap.get((p as any).slug) ?? [])),
            ]
                .map((p) => (p as any).dexNumber)
                .join(',');
            tick('allPokemon');

            return { great: greatList, ultra: ultraList, allPokemon };
        }),
    })),

    withMethods((store) => ({
        getPokemonFilter(pokemon: Base): string {
            const slug = pokemon.slug;
            const rank = store._rankPVP.value();
            if (!rank) return '';
            const subEvolutionsMap = store._subEvolutionsMap();

            function ivToFilterValue(iv: number): number {
                if (iv === 0) return 0;
                if (iv <= 5) return 1;
                if (iv <= 10) return 2;
                if (iv <= 14) return 3;
                return 4;
            }

            const statToFilterKey = (stats: LeagueStats): number => {
                const atq = ivToFilterValue(stats.atk);
                const def = ivToFilterValue(stats.def);
                const sta = ivToFilterValue(stats.sta);
                return atq * 25 + def * 5 + sta;
            };

            const decodeFilterKey = (key: number) => ({
                atq: Math.floor(key / 25),
                def: Math.floor(key / 5) % 5,
                stamina: key % 5,
            });

            const data = rank.get(slug);
            if (!data) return '';
            const table = store._pokemonRepository.cpMultiplier.value();
            const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
            const allIV = [] as LeagueStats[];
            const great = store._getBetterRankWithLimit(slug, 'super', 10);
            const ultra = store._getBetterRankWithLimit(slug, 'hyper', 10);
            if (table && store._pokemonRepository.pureCalculateCp(pokemon as any as Base, table, IV_MAX, 50) > 2480) {
                allIV.push(...ultra);
            }
            if (table && store._pokemonRepository.pureCalculateCp(pokemon as any as Base, table, IV_MAX, 50) > 1480) {
                allIV.push(...great);
            }
            const finalIV = allIV.map(statToFilterKey).unique().map(decodeFilterKey);
            const subEvolutionFilter = (subEvolutionsMap.get(slug) ?? [])
                .map((pokemon) => pokemon.dexNumber)
                .join(', ');
            return store._filterService.buildComboFilter(finalIV) + ' & ' + subEvolutionFilter;
        },
        modifyRank(pokemon: PokemonSlug, newRank: number, league: 'super' | 'hyper', form: 'normal' | 'obscur') {
            const rank = store._getOrInitRank(pokemon);
            rank[league][form] = newRank;
            const newMap = new Map(store.allRank());
            patchState(store, { allRank: newMap });
            store._pvpRankRepository.savePVPRank(store.allRank());
        },
        removeRank(pokemon: PokemonSlug, league: 'super' | 'hyper', form: 'normal' | 'obscur') {
            const rank = store._getOrInitRank(pokemon);
            rank[league][form] = null;
            patchState(store, { allRank: new Map(store.allRank()) });
            store._pvpRankRepository.savePVPRank(store.allRank());
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

            effect(() => {
                const data = store._pvpRankRepository.pvpRankResource.value();
                patchState(store, { allRank: data });
            });
        },
    })),
);
function buildSubEvolutionsMap(allPokemon: Base[]): Map<string, Base[]> {
    const byId = new Map(allPokemon.map((p: any) => [p.pokemonId, p]));
    const byFamily = new Map<string, Base[]>();
    allPokemon.forEach((p: any) => {
        byFamily.ensureArray(p.family).push(p);
    });

    const getAllEvolutionIds = (pokemon: Base): string[] => {
        const directEvos = (pokemon as any).evolutionIds ?? [];
        return [
            ...directEvos,
            ...directEvos.flatMap((evoId: string) => {
                const evo = byId.get(evoId);
                return evo ? getAllEvolutionIds(evo) : [];
            }),
        ];
    };

    const subEvolutionsMap = new Map<string, Base[]>();
    allPokemon.forEach((pokemon: any) => {
        const allEvoIds = getAllEvolutionIds(pokemon);
        const family = byFamily.get(pokemon.family) ?? [];
        subEvolutionsMap.set(
            pokemon.slug,
            family.filter((other: any) => !allEvoIds.includes(other.pokemonId)),
        );
    });

    return subEvolutionsMap;
}
