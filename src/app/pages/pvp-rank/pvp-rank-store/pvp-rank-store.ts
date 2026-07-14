import { computed, effect, inject, resource, ResourceRef } from '@angular/core';
import { Base, PokemonInterface, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, Combo, FilterDef, FilterTier, IV, LeagueStats, RankPVP } from '@entities/stats';
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
type FilterMapValue = {
    pokemonsSlug: PokemonSlug[];
    hasRank1: boolean;
    // futurs champs ici
};
const initialState = {
    allRank: new Map<PokemonSlug, PvpRank>(),
    limitFilterGeneral: 1000,
    limitFilterPokemon: 20,
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
        _pokemonsResource: store._pokemonRepository.allDifferentFormPokemonsSetting as any as ResourceRef<
            PokemonInterface[]
        >,
        _rank1PVP: resource({
            params: () => store._pokemonRepository.rank1PVP.value(),
            loader: async ({ params: pokemons }) => {
                return pokemons as Record<PokemonSlug, RankPVP<IV>>;
            },
            defaultValue: {} as Record<PokemonSlug, RankPVP<IV>>,
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
        isPokemonsAvaible: computed(() => {
            const table = store._pokemonRepository.cpMultiplier.value();
            if (!table) return new Map<PokemonSlug, { super: boolean; hyper: boolean }>();

            return new Map(
                (store._filteredResource.value() as any as Base[]).map((pokemon) => [
                    pokemon.slug,
                    store._pokemonRepository.isPokemonAvailableForLeagues(pokemon, table),
                ]),
            );
        }),
    })),
    withProps((store) => ({
        _rankPVP: resource({
            params: () => {
                if (store._filteredResource.isLoading()) return undefined;
                return store.filteredPokemons().map((p) => p.slug);
            },
            loader: async ({ params: slugs }) => {
                const results: [string, AllRankPVP<IV>][] = [];
                const batchSize = 10;

                for (let i = 0; i < slugs.length; i += batchSize) {
                    const batch = slugs.slice(i, i + batchSize);
                    const batchResults = await Promise.all(
                        batch.map(async (slug) => {
                            const data = await store._pokemonRepository.getPVPRank(slug);
                            return [slug, data] as const;
                        }),
                    );
                    results.push(...(batchResults.filter(([, data]) => data !== null) as [string, AllRankPVP<IV>][]));
                }

                return new Map(results);
            },
        }),
    })),
    withMethods((store) => ({
        setLimitFilterGeneral: (value: number) => patchState(store, { limitFilterGeneral: value }),
        setLimitFilterPokemon: (value: number) => patchState(store, { limitFilterPokemon: value }),
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
        _getBetterRankWithLimit(slug: PokemonSlug, league: League, limit = 4096): LeagueStats<IV>[] {
            const dataBestRankPVP = store._rankPVP.value();
            if (!dataBestRankPVP) return [];

            const allRank = dataBestRankPVP.get(slug);
            if (!allRank) return [];

            const ranks = store.allRank();

            const rank = Math.min((ranks.get(slug)?.[league]?.normal ?? limit + 1) - 1, limit);
            return allRank[league].slice(0, rank);
        },
    })),
    withComputed((store) => ({
        mapOfIconRank1: computed(() => {
            const rank1 = store._rank1PVP.value();
            const leagues = store.isPokemonsAvaible();
            if (!rank1) return new Map();

            const getBadge = (stats: LeagueStats, available: boolean): string | null => {
                if (!available) return '❌';
                const min = Math.min(stats.attack, stats.defense, stats.stamina);
                if (min >= 12) return '🍀';
                if (min >= 10) return '⚔️';
                if (min >= 5) return '🔄';
                if (min >= 4) return '🌦️';
                return null;
            };

            const result = new Map<PokemonSlug, { great: string | null; ultra: string | null }>();
            (store.filteredPokemons() as any as Base[]).forEach((pokemon) => {
                const data = rank1[pokemon.slug];
                const league = leagues.get(pokemon.slug);
                if (!data || !league) return;
                result.set(pokemon.slug, {
                    great: getBadge(data.super, league.super),
                    ultra: getBadge(data.hyper, league.hyper),
                });
            });

            return result;
        }),
        basicRankFilter: computed(() => {
            const rank1 = store._rank1PVP.value();
            const pokemonsDisplay = store._filteredResource.value();
            const subEvolutionMap = store._subEvolutionsMap();
            const filterIV = store._filterService.BASIC_FILTER;
            const filterTier: FilterDef<FilterTier>[] = store._filterService.convertIvToFilterTier(filterIV);
            const buildFiltersFor = (league: 'super' | 'hyper') =>
                filterTier.map((filter) => {
                    const pokemons = (
                        rank1
                            ? pokemonsDisplay.groupBy((pokemon) =>
                                  store._filterService.isInTheFilterTier(filter, rank1[pokemon.slug][league]),
                              )
                            : new Map()
                    ) as Map<boolean, Base[]>;

                    const dexNumberIncluded = pokemons
                        .get(true)
                        ?.map((pokemon) => subEvolutionMap.get(pokemon.slug)?.map((pokemon) => pokemon.dexNumber))
                        .flat()
                        .unique();

                    const dexNumberExcluded = pokemons
                        .get(false)
                        ?.map((pokemon) => subEvolutionMap.get(pokemon.slug)?.map((pokemon) => pokemon.dexNumber))
                        .flat()
                        .unique();
                    const filterPokemonIncluded = dexNumberIncluded?.join(',');
                    const filterPokemonExcluded = dexNumberExcluded?.join(',');

                    return {
                        label: filter.key,
                        filter: `${store._filterService.comboToFilter(filter.combo)} & ${filterPokemonIncluded}`,
                        excludedFilter: `${store._filterService.comboToFilterExcluded(filter.combo)} & ${filterPokemonExcluded}`,
                        length: dexNumberIncluded?.length ?? 0,
                        excludedLength: dexNumberExcluded?.length ?? 0,
                    };
                });

            const filtersSuper = buildFiltersFor('super');
            const filtersHyper = buildFiltersFor('hyper');
            // const filtersSuper = {...filters, pokemons: rank1 ? pokemonsDisplay.map(pokemon => rank1[pokemon.slug].super): []}
            return { super: filtersSuper, hyper: filtersHyper };
        }),
        allRankFilter: computed(() => {
            const tick = createTimer('allRankFilter');
            const mapFilterGreat = new Map<number, FilterMapValue>();
            const mapFilterUltra = new Map<number, FilterMapValue>();

            const rank1 = store._rank1PVP.value();
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
                const attack = ivToFilterValue(stats.attack);
                const defense = ivToFilterValue(stats.defense);
                const stamina = ivToFilterValue(stats.stamina);
                return attack * 25 + defense * 5 + stamina; // encodage en base 5, unique entre 0 et 124
            };
            const decodeFilterKey = (key: number): Combo<FilterTier> =>
                ({
                    attack: Math.floor(key / 25),
                    defense: Math.floor(key / 5) % 5,
                    stamina: key % 5,
                }) as Combo<FilterTier>;
            store.filteredPokemons().forEach((pokemon) => {
                const base = pokemon as any as Base;

                if (store.isPokemonsAvaible().get(pokemon.slug)?.super) {
                    const greatRankBetterThanActualRank = store._getBetterRankWithLimit(
                        base.slug,
                        'super',
                        store.limitFilterGeneral(),
                    );
                    const statsGreat = greatRankBetterThanActualRank;

                    statsGreat?.forEach((stat, index) => {
                        const key = statToFilterKey(stat);
                        let entry = mapFilterGreat.get(key);
                        if (!entry) {
                            entry = { pokemonsSlug: [], hasRank1: false };
                            mapFilterGreat.set(key, entry);
                        }
                        entry.pokemonsSlug.push(base.slug);
                        if (index === 0) entry.hasRank1 = true;
                        // mapFilterGreat.ensureArray(statToFilterKey(stat)).push(base);
                    });
                }

                if (store.isPokemonsAvaible().get(pokemon.slug)?.hyper) {
                    const ultraRankBetterThanActualRank = store._getBetterRankWithLimit(
                        base.slug,
                        'hyper',
                        store.limitFilterGeneral(),
                    );
                    const statHyper = ultraRankBetterThanActualRank;
                    statHyper?.forEach((stat, index) => {
                        const key = statToFilterKey(stat);
                        let entry = mapFilterUltra.get(key);
                        if (!entry) {
                            entry = { pokemonsSlug: [], hasRank1: false };
                            mapFilterUltra.set(key, entry);
                        }
                        entry.pokemonsSlug.push(base.slug);
                        if (index === 0) entry.hasRank1 = true;
                        // mapFilterUltra.ensureArray(statToFilterKey(stat)).push(base);
                    });
                }
            });
            tick('build maps (forEach principal)');

            const toFilterList = (map: Map<number, FilterMapValue>, league: League) =>
                [...map.entries()]
                    .map(([key, { pokemonsSlug, hasRank1 }]) => {
                        const stats = decodeFilterKey(key);
                        const uniquePokemonSlugs = pokemonsSlug.unique();
                        const dexNumbers = new Set(
                            uniquePokemonSlugs
                                .filter((mainSlug) => (store.allRank().get(mainSlug)?.[league]?.normal ?? 0) !== 1)
                                .flatMap((mainSlug) => subEvolutionsMap.get(mainSlug) ?? []),
                        ).toList();
                        const isNotInTheStandardFilter = stats.attack > 1 || stats.defense < 3 || stats.stamina < 3;
                        return {
                            stats,
                            pokemons: dexNumbers as any as Base[],
                            count: uniquePokemonSlugs.length,
                            dexNumbers,
                            isNotInTheStandardFilter,
                            hasRank1,
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
        getPokemonFilter(pokemon: Base, league?: League): string {
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

            const statToFilterKey = (stats: LeagueStats<IV>): number => {
                const atq = ivToFilterValue(stats.attack);
                const def = ivToFilterValue(stats.defense);
                const sta = ivToFilterValue(stats.stamina);
                return atq * 25 + def * 5 + sta;
            };

            const decodeFilterKey = (key: number): Combo<FilterTier> =>
                ({
                    attack: Math.floor(key / 25),
                    defense: Math.floor(key / 5) % 5,
                    stamina: key % 5,
                }) as Combo<FilterTier>;

            const data = rank.get(slug);
            if (!data) return '';
            const IV_MAX = { attack: 15, defense: 15, stamina: 15 };
            const allIV = [] as LeagueStats<IV>[];

            const ultraIsAvaible =
                store.isPokemonsAvaible().get(pokemon.slug)?.hyper && [undefined, 'hyper'].includes(league);
            const greatIsAvaible =
                store.isPokemonsAvaible().get(pokemon.slug)?.super && [undefined, 'super'].includes(league);

            let greatLimit = greatIsAvaible ? store.limitFilterPokemon() : 0;
            let ultraLimit = ultraIsAvaible ? store.limitFilterPokemon() : 0;
            if (ultraIsAvaible) greatLimit /= 2;
            if (greatIsAvaible) ultraLimit /= 2;

            const great = store._getBetterRankWithLimit(slug, 'super', greatLimit);
            const ultra = store._getBetterRankWithLimit(slug, 'hyper', ultraLimit);

            if (ultraIsAvaible) {
                allIV.push(...ultra);
            }
            if (greatIsAvaible) {
                allIV.push(...great);
            }

            console.log(allIV.length);
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
