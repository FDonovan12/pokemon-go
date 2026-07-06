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
import { Base, LeagueStats, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService, GroupedCombo, RangeCombo } from '@services/filter-service/filter-service';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PvpRank, PVPRankStore } from '../pvp-rank/pvp-rank-store/pvp-rank-store';
import { League } from '../pvp-rank/pvp-rank.type';

type RankedStat = {
    rank: number;
    stat: LeagueStats;
    betterCount: number;
    totalCombos: number;
    percentage: number;
};

type RankRow = {
    key: string;
    label: string;
    icon: string;
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

type FilterDef = {
    key: string;
    icon: string;
    combo: GroupedCombo;
};

// ⚠️ Filtres hardcodés à ajuster selon les valeurs que tu veux réellement afficher
const FILTERS: FilterDef[] = [
    {
        key: 'perfect',
        icon: '💯',
        combo: {
            atq: { min: 0, max: 5 },
            def: { min: 11, max: 15 },
            stamina: { min: 11, max: 15 },
        },
    },
    {
        key: 'great-bulk',
        icon: '🛡️',
        combo: {
            atq: { min: 0, max: 10 },
            def: { min: 11, max: 15 },
            stamina: { min: 11, max: 15 },
        },
    },
];

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

    readonly sources = Object.entries(SOURCES).map(([key, value]) => ({
        key: key as Source,
        ...value,
    }));

    readonly filters: FilterDef[] = FILTERS;

    displayMode = signal<'capture' | 'filter'>('capture');

    toggleDisplayMode(): void {
        this.displayMode.update((mode) => (mode === 'capture' ? 'filter' : 'capture'));
    }

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
        return this.filters.map((filter) => ({
            key: filter.key,
            label: this._filterService.groupedComboToFilter(filter.combo),
            icon: filter.icon,
        }));
    });

    bestRanks = computed(() => {
        const data = this.rankPVP.value();
        const table = this._pokemonRepository.cpMultiplier.value();
        const poke = this.pokemon();
        if (!data || !table || !poke) return null;

        const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

        const getBestRank = (league: League, available: boolean): Record<string, RankedStat | null> | null => {
            if (!available) return null;
            if (this.displayMode() === 'capture') {
                return this.getBestRankByCapture(data, league);
            }
            return this.getBestRankByFilter(data, league);
        };

        return {
            great: getBestRank('super', availability.super),
            ultra: getBestRank('hyper', availability.hyper),
        };
    });

    private getBestRankByCapture(data: AllRankPVP, league: League): Record<Source, RankedStat | null> {
        const ranks = data[league];
        const resultList = this.sources.map((source) => {
            const minIv = source.minIv;
            const index = ranks.findIndex((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv);
            if (index === -1) return { key: source.key, value: null };

            const sliced = ranks.slice(0, this.actualRank()?.[league].normal ?? 4096);
            const betterCount = sliced.filter((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv).length;

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
        const resultList = this.filters.map((filter) => {
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
            this.matchesRange(r.atk, combo.atq) &&
            this.matchesRange(r.def, combo.def) &&
            this.matchesRange(r.sta, combo.stamina)
        );
    }

    private comboSize(combo: GroupedCombo): number {
        const size = (range: RangeCombo) => range.max - range.min + 1;
        return size(combo.atq) * size(combo.def) * size(combo.stamina);
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
