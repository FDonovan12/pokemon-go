import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, HostListener, inject, input, resource, ResourceRef, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Base, LeagueStats, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, PokemonRepository } from '@repositories/pokemon/pokemon.repository';
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
// type Source = keyof typeof MIN_IVS;

@Component({
    selector: 'app-pvp-rank-detail-page',
    imports: [ImagePokemon, NgTemplateOutlet],
    templateUrl: './pvp-rank-detail-page.html',
    styleUrl: './pvp-rank-detail-page.css',
})
export class PvpRankDetailPage {
    readonly sources = Object.entries(SOURCES).map(([key, value]) => ({
        key: key as Source,
        ...value,
    }));

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

    bestRanks = computed(() => {
        const data = this.rankPVP.value();
        const table = this._pokemonRepository.cpMultiplier.value();
        const poke = this.pokemon();
        if (!data || !table || !poke) return null;

        const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

        const getBestRank = (league: League, available: boolean): Record<Source, RankedStat | null> | null => {
            const ranks = data[league];
            if (!available) return null;
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
            const resultObject = resultList.toObject(
                (obj) => obj.key,
                (obj) => obj.value,
            );
            return resultObject;
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
