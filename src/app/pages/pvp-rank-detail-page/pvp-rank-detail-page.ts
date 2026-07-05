import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, HostListener, inject, input, resource, ResourceRef, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Base, LeagueStats, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PvpRank, PVPRankStore } from '../pvp-rank/pvp-rank-store/pvp-rank-store';
import { League } from '../pvp-rank/pvp-rank.type';

const MIN_IVS = {
    meilleur: 0,
    meteo: 4,
    echange: 5,
    raid: 10,
    chanceux: 12,
} as const;
type Source = keyof typeof MIN_IVS;
type RankedStat = {
    rank: number;
    stat: LeagueStats;
    betterCount: number;
    totalCombos: number;
    percentage: number;
};
const SOURCE_COMBOS = Object.fromEntries(
    Object.entries(MIN_IVS).map(([source, minIv]) => [source, (16 - minIv) ** 3]),
) as Record<Source, number>;
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

    pokemon: Signal<Base | undefined> = computed(() =>
        this._pokemonRepository.allDifferentFormPokemonsSetting.value()?.find((p) => p.slug === this.slug()),
    );

    rankPVP: ResourceRef<AllRankPVP | undefined> = resource({
        params: () => this.slug(),
        loader: async ({ params: slug }) => this._pokemonRepository.getPVPRank(slug),
    });

    actualRank: Signal<PvpRank | undefined> = computed(() => this._pVPRankStore.allRank().get(this.slug()));
    getRankDelta(source: Source, league: 'great' | 'ultra'): 'better' | 'worse' | 'same' | null {
        const actual = league === 'great' ? this.actualRank()?.super?.normal : this.actualRank()?.hyper?.normal;
        const best = this.bestRanks()?.[league]?.[source];
        if (!actual || !best) return null;
        if (best.rank < actual) return 'better';
        if (best.rank > actual) return 'same';
        return 'same';
    }
    bestRanks = computed(() => {
        const data = this.rankPVP.value();
        const table = this._pokemonRepository.cpMultiplier.value();
        const poke = this.pokemon();
        if (!data || !table || !poke) return null;

        const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

        const getBestRank = (league: League, available: boolean): Record<Source, RankedStat | null> | null => {
            const ranks = data[league];
            if (!available) return null;
            return Object.fromEntries(
                Object.entries(MIN_IVS).map(([source, minIv]) => {
                    const index = ranks.findIndex((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv);
                    if (index === -1) return [source, null];

                    const sliced = ranks.slice(0, this.actualRank()?.[league].normal ?? 4096);
                    const betterCount = sliced.filter((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv).length;
                    console.log(sliced.length, betterCount, index);

                    const totalCombos = SOURCE_COMBOS[source as Source];
                    const percentage = Math.round((betterCount / totalCombos) * 1000) / 10;

                    return [source, { rank: index + 1, stat: ranks[index], betterCount, totalCombos, percentage }];
                }),
            ) as Record<Source, RankedStat | null>;
        };

        return {
            great: getBestRank('super', availability.super),
            ultra: getBestRank('hyper', availability.hyper),
        };
    });

    constructor() {
        effect(() => {
            const allPokemons = this._pokemonRepository.allDifferentFormPokemonsSetting.value();
            if (!this.pokemon() && allPokemons.length > 0) {
                this._router.navigate(['pvp-rank']);
            }
        });
    }
    readonly sources = Object.keys(MIN_IVS) as Source[];

    readonly sourceLabels: Record<Source, string> = {
        meilleur: 'Rank 1',
        meteo: 'Météo',
        echange: 'Échange',
        raid: 'Raid / œuf',
        chanceux: 'Chanceux',
    };

    readonly sourceIcons: Record<Source, string> = {
        meilleur: '⭐',
        meteo: '🌦️',
        echange: '🔄',
        raid: '⚔️',
        chanceux: '🍀',
    };

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this._router.navigate(['pvp-rank']);
        }
    }
}
