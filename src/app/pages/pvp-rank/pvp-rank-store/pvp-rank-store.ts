import { computed, effect, inject, resource } from '@angular/core';
import { Base, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, Combo, FilterDef, FilterTier, IV, ivToFilterValue, LeagueStats } from '@entities/stats';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { KeyRankExcluded, PvpRankRepository } from '@repositories/pvp-rank-repository/pvp-rank.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { withPokemonSearch } from '@shared/features/pokemon-search/with-pokemon-search.feature';
import { CustomSearchResolver } from '@shared/features/pokemon-search/with-pokemon-text-search.feature';
import { createTimer, localStorageSignal } from '@shared/utils/utils';
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

const MAX_PVP_RANK = 4096;
type FilterMapValue = {
    pokemonsSlug: PokemonSlug[];
    hasRank1: boolean;
};

const initialState = {
    allRank: new Map<PokemonSlug, PvpRank>(),
    _importantPokemons: new Set<PokemonSlug>(),
    _excludedRanks: new Set<KeyRankExcluded>(),
};

export const PVPRankStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps((store) => ({
        _customSearch: ((search, allPokemons) => {
            const rank = Number(search);
            if (Number.isNaN(rank)) return undefined;
            const allRank = store.allRank();
            const filtered = allPokemons.filter((p) => {
                const r = allRank.get(p.slug);
                if (!r) return false;
                const bestRank = Math.min(
                    r.super.normal ?? MAX_PVP_RANK,
                    r.super.obscur ?? MAX_PVP_RANK,
                    r.hyper.normal ?? MAX_PVP_RANK,
                    r.hyper.obscur ?? MAX_PVP_RANK,
                );
                return bestRank <= rank;
            });
            return filtered;
        }) satisfies CustomSearchResolver<Base>,
    })),
    withPokemonSearch<Base>(),
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
        _pvpRankRepository: inject(PvpRankRepository),
        _filterService: inject(FilterService),
    })),
    withProps((store) => ({
        limitFilterGeneral: localStorageSignal('LIMIT_FILTER_GENERAL_PVP_KEY', 1000),
        limitFilterPokemon: localStorageSignal('LIMIT_FILTER_POKEMON_PVP_KEY', 20),
        _pokemonsResource: store._pokemonRepository.allDifferentFormPokemonsSetting,
    })),
    withProps((store) => ({
        _filteredResource: resource({
            params: () => {
                const pokemons = store.resultSelected();
                if (!pokemons.length) return undefined;
                return { pokemons };
            },
            loader: async ({ params: { pokemons } }) => {
                const IV_MAX = { attack: 15, defense: 15, stamina: 15 } as Combo<IV>;
                return pokemons.filter(
                    (pokemon) => store._pokemonRepository.pureCalculateCp(pokemon, IV_MAX, 50) > 1480,
                );
            },
            defaultValue: [] as Base[],
        }),
    })),
    withComputed((store) => ({
        isLoading: computed(() => store._pokemonsResource.isLoading() || store._filteredResource.isLoading()),
        filteredPokemons: computed(() => {
            if (!store._filteredResource.isLoading()) {
                return store._filteredResource.value() ?? [];
            }
            store.allRank().get('Bulbizarre')?.super.normal;

            return store.resultSelected();
        }),
        _subEvolutionsMap: computed(() => buildSubEvolutionsMap(store._pokemonsResource.value())),
        isPokemonsAvaible: computed(() => {
            return new Map(
                store
                    ._allPokemons()
                    .map((pokemon) => [pokemon.slug, store._pokemonRepository.getPokemonLeagueAvailability(pokemon)]),
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
        setLimitFilterGeneral: (value: number) => store.limitFilterGeneral.set(value),
        setLimitFilterPokemon: (value: number) => store.limitFilterPokemon.set(value),
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

            const actualRank = ranks.get(slug)?.[league]?.normal ?? limit + 1;
            return allRank[league].filter((stats) => stats.rank < actualRank);
        },
        isRankExcluded(slug: PokemonSlug, league: League, form: 'normal' | 'obscur'): boolean {
            const key = `${slug}:${league}:${form}` as KeyRankExcluded;
            return store._excludedRanks().has(key);
        },
        toggleRankExcluded(slug: PokemonSlug, league: League, form: 'normal' | 'obscur'): void {
            const set = new Set<KeyRankExcluded>(store._excludedRanks());
            const key = `${slug}:${league}:${form}` as KeyRankExcluded;
            if (set.has(key)) {
                set.delete(key);
            } else {
                set.add(key);
            }
            patchState(store, { _excludedRanks: set });
            void store._pvpRankRepository.saveRankExcluded(set);
        },
        toggleImportantPokemon(slug: PokemonSlug): void {
            const set = new Set<PokemonSlug>(store._importantPokemons());
            if (set.has(slug)) {
                set.delete(slug);
            } else {
                set.add(slug);
            }
            patchState(store, { _importantPokemons: set });
            void store._pvpRankRepository.saveImportantPokemons(set);
        },
        isImportantPokemon(slug: PokemonSlug): boolean {
            return store._importantPokemons().has(slug);
        },
        isPokemonAvaible: (pokemon: Base) => {
            return store._pokemonRepository.getPokemonLeagueAvailability(pokemon);
        },
        _getBadgePokemon(pokemon: Base) {
            const getBadge = (stats: LeagueStats<IV>[], available: boolean): string | null => {
                if (!available) return '❌';
                const min = stats.reduce((min, stat) => Math.min(stat.attack, stat.defense, stat.stamina, min), 15);
                if (min >= 15) return '⭐';
                if (min >= 12) return '🍀';
                if (min >= 10) return '⚔️';
                if (min >= 5) return '🔄';
                if (min >= 4) return '🌦️';
                return null;
            };
            const data = store._pokemonRepository.rank1Pvp.get(pokemon.slug);
            if (!data) return;
            const isAvaible = store._pokemonRepository.getPokemonLeagueAvailability(pokemon);
            return {
                great: getBadge(data.super, isAvaible.super),
                ultra: getBadge(data.hyper, isAvaible.hyper),
            };
        },
    })),
    withMethods((store) => ({
        _pokemonIsWorseThanRank(slug: PokemonSlug, league: League, rank: number = 1): boolean {
            const ranks: PvpRank = store._getOrInitRank(slug);
            if (store.isRankExcluded(slug, league, 'normal')) return false;
            return (ranks[league].normal ?? 4096) > rank;
        },
    })),
    withComputed((store) => ({
        badgesByPokemon: computed(() => {
            const pokemons = store.filteredPokemons(); // ta liste actuelle, à adapter au nom réel

            return new Map(pokemons.map((pokemon) => [pokemon.slug, store._getBadgePokemon(pokemon)]));
        }),
        basicRankFilter: computed(() => {
            const pokemonsToFilter = store._allPokemons();
            const subEvolutionMap = store._subEvolutionsMap();
            const filterIV = store._filterService.BASIC_FILTER;
            const filterTier: FilterDef<FilterTier>[] = store._filterService.convertIvToFilterTier(filterIV);
            const pokemonBySlug = new Map(pokemonsToFilter.map((p) => [p.slug, p]));

            const remainingSuper = new Set<PokemonSlug>();
            const remainingHyper = new Set<PokemonSlug>();

            pokemonsToFilter.forEach((pokemon) => {
                const validSuper =
                    store._pokemonIsWorseThanRank(pokemon.slug, 'super', 1) &&
                    store._pokemonRepository.getPokemonLeagueAvailability(pokemon).super;
                const validHyper =
                    store._pokemonIsWorseThanRank(pokemon.slug, 'hyper', 1) &&
                    store._pokemonRepository.getPokemonLeagueAvailability(pokemon).hyper;
                if (validSuper) remainingSuper.add(pokemon.slug);
                if (validHyper) remainingHyper.add(pokemon.slug);
            });

            const tierDexSlugs: PokemonSlug[][] = filterTier.map((filter) => {
                const includedSlugs: PokemonSlug[] = [];

                remainingSuper.forEach((slug) => {
                    const ranks = store._pokemonRepository.rank1Pvp.get(slug)?.super;
                    if (ranks && ranks.some((rank) => store._filterService.isInTheFilterTier(filter, rank))) {
                        const pokemon = pokemonBySlug.get(slug);
                        if (pokemon) includedSlugs.push(slug);
                        remainingSuper.delete(slug);
                    }
                });
                remainingHyper.forEach((slug) => {
                    const ranks = store._pokemonRepository.rank1Pvp.get(slug)?.hyper;
                    if (ranks && ranks.some((rank) => store._filterService.isInTheFilterTier(filter, rank))) {
                        const pokemon = pokemonBySlug.get(slug);
                        if (pokemon) includedSlugs.push(slug);
                        remainingHyper.delete(slug);
                    }
                });

                return includedSlugs;
            });

            const tierDexNumbers = tierDexSlugs.map((filter) =>
                filter
                    .map((slug) => subEvolutionMap.get(slug)?.map((pokemon) => pokemon.dexNumber))
                    .flat()
                    .compact()
                    .unique()
                    .sortAsc(),
            );

            const tierFilters = filterTier.map((filter, i) => ({
                label: filter.key,
                filter: `!# & ${store._filterService.comboToFilter(filter.combo)} & ${tierDexNumbers[i].join(',')}`,
                length: tierDexNumbers[i].length,
            }));

            const importantSlugs = store._importantPokemons();
            const remainingSlugs = new Set<PokemonSlug>([...remainingSuper, ...remainingHyper, ...importantSlugs]);
            const dexNumberRemaining = ([...remainingSlugs]
                .map((slug) => subEvolutionMap.get(slug)?.map((p) => p.dexNumber))
                .flat()
                .compact()
                .unique()
                .sortAsc() ?? []) as number[];
            const dexNumberRemainingSet = new Set(dexNumberRemaining);

            const remainingFilter = {
                label: 'reste',
                filter: `!# & ${dexNumberRemaining.join(',')}, obscur`,
                length: dexNumberRemaining.length,
            };
            // "no-verif" : par signature exacte de tiers, en excluant tout dexNumber déjà dans remainingFilter
            const dexToTierIndices = new Map<number, Set<number>>();
            tierDexNumbers.forEach((dexList, tierIndex) => {
                dexList.forEach((dex) => {
                    if (dexNumberRemainingSet.has(dex)) return; // priorité à remainingFilter
                    if (!dexToTierIndices.has(dex)) dexToTierIndices.set(dex, new Set());
                    dexToTierIndices.get(dex)!.add(tierIndex);
                });
            });

            const groupKey = (tiers: Set<number>) => [...tiers].sort((a, b) => a - b).join('-');
            const dexByGroup = new Map<string, number[]>();
            dexToTierIndices.forEach((tiers, dex) => {
                const key = groupKey(tiers);
                if (!dexByGroup.has(key)) dexByGroup.set(key, []);
                dexByGroup.get(key)!.push(dex);
            });

            // Univers complet, on retire tout ce qui est déjà couvert (tiers + reste)
            const uncoveredDexNumbers = new Set(pokemonsToFilter.map((p) => p.dexNumber));
            tierDexNumbers.forEach((dexList) => dexList.forEach((dex) => uncoveredDexNumbers.delete(dex)));
            dexNumberRemaining.forEach((dex) => uncoveredDexNumbers.delete(dex));
            const noVerif = [...dexByGroup.entries()].map(([key, dexList]) => {
                const tierIndices = key.split('-').map(Number);
                const excludedCombo = tierIndices
                    .map((i) => store._filterService.comboToFilterExcluded(filterTier[i].combo))
                    .join(' & ');
                const fullDexList = [...dexList, ...uncoveredDexNumbers].unique() as number[];
                return {
                    label: `sans-verif-${key}`,
                    filter: `!# & ${excludedCombo} & ${fullDexList.join(',')} & !obscur`,
                    length: dexList.length,
                };
            });
            const uncoveredEntry = {
                label: 'sans-verif-jamais-couvert',
                filter: `!# & ${uncoveredDexNumbers.toList().join(',')} & !obscur`,
                length: uncoveredDexNumbers.toList().length,
            };
            return {
                filters: [...tierFilters, remainingFilter],
                noVerif: [...noVerif, uncoveredEntry],
            };
        }),
        allRankFilter: computed(() => {
            const tick = createTimer('allRankFilter');
            const mapFilterGreat = new Map<number, FilterMapValue>();
            const mapFilterUltra = new Map<number, FilterMapValue>();

            const rank = store._rankPVP.value();
            if (!rank) return { great: [], ultra: [], allPokemon: '' };
            tick('setup + rank value');
            const subEvolutionsMap = store._subEvolutionsMap();
            tick('subEvolutionsMap');
            function ivToFilterValue(iv: IV): FilterTier {
                if (iv === 0) return 0 as FilterTier;
                if (iv <= 5) return 1 as FilterTier;
                if (iv <= 10) return 2 as FilterTier;
                if (iv <= 14) return 3 as FilterTier;
                return 4 as FilterTier;
            }
            const statToFilterKey = (stats: LeagueStats<IV>): number => {
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
                if (
                    !store._pokemonRepository.getPokemonLeagueAvailability(pokemon).super &&
                    !store._pokemonRepository.getPokemonLeagueAvailability(pokemon).hyper
                ) {
                    return;
                }

                if (store._pokemonRepository.getPokemonLeagueAvailability(pokemon).super) {
                    const greatRankBetterThanActualRank = store._getBetterRankWithLimit(
                        pokemon.slug,
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
                        entry.pokemonsSlug.push(pokemon.slug);
                        if (index === 0) entry.hasRank1 = true;
                        // mapFilterGreat.ensureArray(statToFilterKey(stat)).push(base);
                    });
                }

                if (store._pokemonRepository.getPokemonLeagueAvailability(pokemon).hyper) {
                    const ultraRankBetterThanActualRank = store._getBetterRankWithLimit(
                        pokemon.slug,
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
                        entry.pokemonsSlug.push(pokemon.slug);
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
                        const dexNumbers = new Set<Base>(
                            uniquePokemonSlugs
                                .filter((mainSlug) => (store.allRank().get(mainSlug)?.[league]?.normal ?? 0) !== 1)
                                .flatMap((mainSlug) => subEvolutionsMap.get(mainSlug) ?? []),
                        ).toList();
                        const isNotInTheStandardFilter = stats.attack > 1 || stats.defense < 3 || stats.stamina < 3;
                        return {
                            stats,
                            pokemons: dexNumbers,
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

            const allPokemon = [...new Set(store.filteredPokemons().flatMap((p) => subEvolutionsMap.get(p.slug) ?? []))]
                .map((p) => p.dexNumber)
                .join(',');
            tick('allPokemon');

            return { great: greatList, ultra: ultraList, allPokemon };
        }),
    })),

    withMethods((store) => ({
        getPokemonFilter(pokemon: Base, league: League): string {
            const slug = pokemon.slug;
            const rank = store._rankPVP.value();
            if (!rank) return '';
            const subEvolutionsMap = store._subEvolutionsMap();

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
            const allIV = [] as LeagueStats<IV>[];

            const ultraIsAvaible =
                store._pokemonRepository.getPokemonLeagueAvailability(pokemon).hyper && league === 'hyper';
            const greatIsAvaible =
                store._pokemonRepository.getPokemonLeagueAvailability(pokemon).super && league === 'super';

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

            effect(() => {
                const data = store._pvpRankRepository.pvpImportantPokemonResource.value();
                patchState(store, { _importantPokemons: data });
            });
            effect(() => {
                const data = store._pvpRankRepository.pvpRankExcludedResource.value();
                patchState(store, { _excludedRanks: data });
            });
        },
    })),
);

function buildSubEvolutionsMap(allPokemon: Base[]): Map<PokemonSlug, Base[]> {
    const byIdAndForm = new Map(allPokemon.map((p) => [`${p.pokemonId}::${p.form}`, p]));

    const parentsById = new Map<string, Base[]>();
    allPokemon.forEach((pokemon) => {
        pokemon.evolutionIds.forEach(({ pokemonId, form }) => {
            const target = byIdAndForm.get(`${pokemonId}::${form}`);
            if (!target) return;
            parentsById.ensureArray(target.id).push(pokemon);
        });
    });

    const getAllAncestors = (pokemon: Base): Base[] => {
        const directParents = parentsById.get(pokemon.id) ?? [];
        return [...directParents, ...directParents.flatMap((parent) => getAllAncestors(parent))];
    };

    const subEvolutionsMap = new Map<PokemonSlug, Base[]>();
    allPokemon.forEach((pokemon) => {
        subEvolutionsMap.set(pokemon.slug, [pokemon, ...getAllAncestors(pokemon)]);
    });

    return subEvolutionsMap;
}
