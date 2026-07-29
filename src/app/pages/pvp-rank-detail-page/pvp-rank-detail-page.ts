import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    computed,
    effect,
    HostListener,
    inject,
    input,
    resource,
    ResourceRef,
    signal,
    Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Base, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, GroupedCombo, LeagueStats, RangeCombo } from '@entities/stats';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PvpRank, PVPRankStore } from '../pvp-rank/pvp-rank-store/pvp-rank-store';
import { League } from '../pvp-rank/pvp-rank.type';

type MatchesByLeague = Map<string, RankedStat[]>;
type RankedStat = {
    rank: number;
    stat: LeagueStats;
    betterCount: number;
    totalCombos: number;
    percentage: number;
};
type AllMatchesResult = {
    great: RankedStat[] | null;
    ultra: RankedStat[] | null;
};
type RankRow = {
    key: string;
    label: string;
    icon?: string;
};

const createSource = (minIv: number, label: string, icon: string) => ({
    minIv,
    combos: (16 - minIv) ** 3,
    label,
    icon,
});

const SOURCES = {
    meilleur: createSource(0, 'Rank 1', '⭐'),
    meteo: createSource(4, 'Météo', '🌦️'),
    echange: createSource(5, 'Échange', '🔄'),
    raid: createSource(10, 'Raid / œuf', '⚔️'),
    chanceux: createSource(12, 'Chanceux', '🍀'),
} as const;

type Source = keyof typeof SOURCES;

const DISPLAY_MODE_LOCAL_STORAGE = 'pokemon-display-mode-local-storage';

@Component({
    selector: 'app-pvp-rank-detail-page',
    imports: [ImagePokemon, NgTemplateOutlet],
    templateUrl: './pvp-rank-detail-page.html',
    styleUrl: './pvp-rank-detail-page.css',
})
export class PvpRankDetailPage {
    slug: Signal<PokemonSlug> = input.required<PokemonSlug>();
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);
    private readonly _pVPRankStore = inject(PVPRankStore);
    private readonly _router = inject(Router);
    private readonly _filterService: FilterService = inject(FilterService);
    private readonly _localStorageService: LocalStorageService = inject(LocalStorageService);

    readonly sources = Object.entries(SOURCES).map(([key, value]) => ({
        key: key as Source,
        ...value,
    }));

    displayMode = signal<'capture' | 'filter'>(this._localStorageService.get(DISPLAY_MODE_LOCAL_STORAGE, 'capture'));

    toggleDisplayMode(): void {
        this.displayMode.update((mode) => (mode === 'capture' ? 'filter' : 'capture'));
        console.log('toggleDisplayMode');
        this._localStorageService.set(DISPLAY_MODE_LOCAL_STORAGE, this.displayMode());
    }
    expandedRows = signal<Set<string>>(new Set());
    toggleRow(key: string): void {
        this.expandedRows.update((set) => {
            const next = new Set(set);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }

    isRowExpanded(key: string): boolean {
        return this.expandedRows().has(key);
    }

    // allMatchesForRow(row: RankRow): AllMatchesResult | null {
    //     const data = this.rankPVP.value();
    //     const poke = this.pokemon();
    //     const table = this._pokemonRepository.cpMultiplier.value();
    //     if (!data || !poke || !table) return null;

    //     const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

    //     const getAllMatches = (league: League, available: boolean): RankedStat[] | null => {
    //         if (!available) return null;
    //         const ranks = data[league];

    //         const matches: LeagueStats[] =
    //             this.displayMode() === 'capture'
    //                 ? ranks.filter((r) => {
    //                       const source = SOURCES[row.key as Source];
    //                       return r.attack >= source.minIv && r.defense >= source.minIv && r.stamina >= source.minIv;
    //                   })
    //                 : ranks.filter((r) => {
    //                       const filter = this._filterService.BASIC_FILTER.find((f) => f.key === row.key);
    //                       return filter ? this.matchesCombo(r, filter.combo) : false;
    //                   });

    //         const totalCombos =
    //             this.displayMode() === 'capture'
    //                 ? SOURCES[row.key as Source].combos
    //                 : this.comboSize(this._filterService.BASIC_FILTER.find((f) => f.key === row.key)!.combo);

    //         return matches.map((stat, index) => ({
    //             rank: index + 1,
    //             stat,
    //             betterCount: index + 1,
    //             totalCombos,
    //             percentage: Math.round(((index + 1) / totalCombos) * 1000) / 10,
    //         }));
    //     };

    //     return {
    //         great: getAllMatches('super', availability.super),
    //         ultra: getAllMatches('hyper', availability.hyper),
    //     };
    // }
    pokemon: Signal<Base | undefined> = computed(() =>
        this._pokemonRepository.allDifferentFormPokemonsSetting.value()?.find((p) => p.slug === this.slug()),
    );

    rankPVP: ResourceRef<AllRankPVP | undefined> = resource({
        params: () => this.slug(),
        loader: async ({ params: slug }) => this._pokemonRepository.getPVPRank(slug),
    });

    actualRank: Signal<PvpRank | undefined> = computed(() => this._pVPRankStore.allRank().get(this.slug()));

    rows: Signal<RankRow[]> = computed(() => {
        if (this.displayMode() === 'capture') {
            return this.sources.map((source) => ({
                key: source.key,
                label: source.label,
                icon: source.icon,
            }));
        }
        return this._filterService.BASIC_FILTER.map((filter) => ({
            key: filter.key,
            label: this._filterService.groupedComboToLabel(filter.combo),
        }));
    });
    readonly matchesByRow = computed(() => {
        const data = this.rankPVP.value();
        const poke = this.pokemon();
        const table = this._pokemonRepository.cpMultiplier.value();
        if (!data || !poke || !table) return null;

        const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

        const computeForLeague = (league: League, available: boolean): MatchesByLeague => {
            const map: MatchesByLeague = new Map();
            if (!available) return map;
            const ranks = data[league];
            const actualLimit = (this.actualRank()?.[league].normal ?? 4096) - 1;
            const sliced = ranks.slice(0, actualLimit);
            console.log(league, sliced);

            const filterAndBuild = (matchFn: (r: LeagueStats) => boolean, totalCombos: number): RankedStat[] => {
                const betterCount = sliced.filter(matchFn).length;
                const percentage = Math.round((betterCount / totalCombos) * 10000) / 100;

                const result: RankedStat[] = [];
                ranks.forEach((stat, index) => {
                    if (matchFn(stat)) {
                        result.push({
                            rank: index + 1,
                            stat,
                            betterCount,
                            totalCombos,
                            percentage,
                        });
                    }
                });
                return result;
            };

            if (this.displayMode() === 'capture') {
                for (const source of this.sources) {
                    map.set(
                        source.key,
                        filterAndBuild(
                            (r) => r.attack >= source.minIv && r.defense >= source.minIv && r.stamina >= source.minIv,
                            source.combos,
                        ),
                    );
                }
            } else {
                for (const filter of this._filterService.BASIC_FILTER) {
                    const totalCombos = this.comboSize(filter.combo);
                    map.set(
                        filter.key,
                        filterAndBuild((r) => this.matchesCombo(r, filter.combo), totalCombos),
                    );
                }
            }
            return map;
        };

        return {
            great: computeForLeague('super', availability.super),
            ultra: computeForLeague('hyper', availability.hyper),
        };
    });

    allMatchesForRow(row: RankRow): AllMatchesResult | null {
        const matches = this.matchesByRow();
        if (!matches) return null;
        console.log(row);
        return {
            great: matches.great.size ? (matches.great.get(row.key) ?? []) : null,
            ultra: matches.ultra?.size ? (matches.ultra.get(row.key) ?? []) : null,
        };
    }
    bestRanks = computed(() => {
        const matches = this.matchesByRow();
        if (!matches) return null;

        const toBestRecord = (map: MatchesByLeague): Record<string, RankedStat | null> | null => {
            if (map.size === 0) return null;
            const obj: Record<string, RankedStat | null> = {};
            for (const [key, list] of map) obj[key] = list[0] ?? null;
            return obj;
        };

        return {
            great: toBestRecord(matches.great),
            ultra: toBestRecord(matches.ultra),
        };
    });
    // bestRanks = computed(() => {
    //     const data = this.rankPVP.value();
    //     const table = this._pokemonRepository.cpMultiplier.value();
    //     const poke = this.pokemon();
    //     if (!data || !table || !poke) return null;

    //     const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

    //     const getBestRank = (league: League, available: boolean): Record<string, RankedStat | null> | null => {
    //         if (!available) return null;
    //         if (this.displayMode() === 'capture') {
    //             return this.getBestRankByCapture(data, league);
    //         }
    //         return this.getBestRankByFilter(data, league);
    //     };

    //     return {
    //         great: getBestRank('super', availability.super),
    //         ultra: getBestRank('hyper', availability.hyper),
    //     };
    // });

    private getBestRankByCapture(data: AllRankPVP, league: League): Record<Source, RankedStat | null> {
        const ranks = data[league];
        const resultList = this.sources.map((source) => {
            const minIv = source.minIv;
            const index = ranks.findIndex((r) => r.attack >= minIv && r.defense >= minIv && r.stamina >= minIv);
            if (index === -1) return { key: source.key, value: null };

            const sliced = ranks.slice(0, this.actualRank()?.[league].normal ?? 4096);
            const betterCount = sliced.filter(
                (r) => r.attack >= minIv && r.defense >= minIv && r.stamina >= minIv,
            ).length;

            const totalCombos = source.combos;
            const percentage = Math.round((betterCount / totalCombos) * 1000) / 10;

            return {
                key: source.key,
                value: { rank: index + 1, stat: ranks[index], betterCount, totalCombos, percentage },
            };
        });
        return resultList.toObject(
            (obj) => obj.key,
            (obj) => obj.value,
        );
    }

    private getBestRankByFilter(data: AllRankPVP, league: League): Record<string, RankedStat | null> {
        const ranks = data[league];
        const resultList = this._filterService.BASIC_FILTER.map((filter) => {
            const index = ranks.findIndex((r) => this.matchesCombo(r, filter.combo));
            if (index === -1) return { key: filter.key, value: null };

            const sliced = ranks.slice(0, this.actualRank()?.[league].normal ?? 4096);
            const betterCount = sliced.filter((r) => this.matchesCombo(r, filter.combo)).length;

            const totalCombos = this.comboSize(filter.combo);
            const percentage = Math.round((betterCount / totalCombos) * 1000) / 10;

            return {
                key: filter.key,
                value: { rank: index + 1, stat: ranks[index], betterCount, totalCombos, percentage },
            };
        });
        return resultList.toObject(
            (obj) => obj.key,
            (obj) => obj.value,
        );
    }

    private matchesRange(value: number, range: RangeCombo): boolean {
        return value >= range.min && value <= range.max;
    }

    private matchesCombo(r: LeagueStats, combo: GroupedCombo): boolean {
        return (
            this.matchesRange(r.attack, combo.attack) &&
            this.matchesRange(r.defense, combo.defense) &&
            this.matchesRange(r.stamina, combo.stamina)
        );
    }

    private comboSize(combo: GroupedCombo): number {
        const size = (range: RangeCombo) => range.max - range.min + 1;
        return size(combo.attack) * size(combo.defense) * size(combo.stamina);
    }

    // bestRanks = computed(() => {
    //     const data = this.rankPVP.value();
    //     const table = this._pokemonRepository.cpMultiplier.value();
    //     const poke = this.pokemon();
    //     if (!data || !table || !poke) return null;

    //     const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

    //     const getBestRank = (league: League, available: boolean): Record<Source, RankedStat | null> | null => {
    //         const ranks = data[league];
    //         if (!available) return null;
    //         const resultList = this.sources.map((source) => {
    //             const minIv = source.minIv;
    //             const index = ranks.findIndex((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv);
    //             if (index === -1) return { key: source.key, value: null };

    //             const sliced = ranks.slice(0, this.actualRank()?.[league].normal ?? 4096);
    //             const betterCount = sliced.filter((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv).length;

    //             const totalCombos = source.combos;
    //             const percentage = Math.round((betterCount / totalCombos) * 1000) / 10;

    //             return {
    //                 key: source.key,
    //                 value: { rank: index + 1, stat: ranks[index], betterCount, totalCombos, percentage },
    //             };
    //         });
    //         const resultObject = resultList.toObject(
    //             (obj) => obj.key,
    //             (obj) => obj.value,
    //         );
    //         return resultObject;
    //     };

    //     return {
    //         great: getBestRank('super', availability.super),
    //         ultra: getBestRank('hyper', availability.hyper),
    //     };
    // });

    constructor() {
        effect(() => {
            const allPokemons = this._pokemonRepository.allDifferentFormPokemonsSetting.value();
            if (!this.pokemon() && allPokemons.length > 0) {
                this._router.navigate(['pvp-rank']);
            }
        });
    }

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this._router.navigate(['pvp-rank']);
        }
    }

    getRankDelta(source: Source, league: 'great' | 'ultra'): 'better' | 'worse' | 'same' | null {
        const actual = league === 'great' ? this.actualRank()?.super?.normal : this.actualRank()?.hyper?.normal;
        const best = this.bestRanks()?.[league]?.[source];
        if (!actual || !best) return null;
        if (best.rank < actual) return 'better';
        if (best.rank > actual) return 'worse';
        return 'same';
    }
}
