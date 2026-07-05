import { Component, computed, effect, HostListener, inject, input, resource, ResourceRef, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Base, LeagueStats, PokemonSlug } from '@entities/pokemon';
import { AllRankPVP, PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';

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
};
@Component({
    selector: 'app-pvp-rank-detail-page',
    imports: [ImagePokemon],
    templateUrl: './pvp-rank-detail-page.html',
    styleUrl: './pvp-rank-detail-page.css',
})
export class PvpRankDetailPage {
    slug: Signal<PokemonSlug> = input.required<PokemonSlug>();
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);
    private readonly _router = inject(Router);

    pokemon: Signal<Base | undefined> = computed(() =>
        this._pokemonRepository.allDifferentFormPokemonsSetting.value()?.find((p) => p.slug === this.slug()),
    );

    rankPVP: ResourceRef<AllRankPVP | undefined> = resource({
        params: () => this.slug(),
        loader: async ({ params: slug }) => this._pokemonRepository.getPVPRank(slug),
    });

    bestRanks = computed(() => {
        const data = this.rankPVP.value();
        const table = this._pokemonRepository.cpMultiplier.value();
        const poke = this.pokemon();
        if (!data || !table || !poke) return null;

        const availability = this._pokemonRepository.isPokemonAvailableForLeagues(poke as any, table);

        const getBestRank = (ranks: LeagueStats[], available: boolean) => {
            if (!available) return null;
            return Object.fromEntries(
                Object.entries(MIN_IVS).map(([source, minIv]) => {
                    const index = ranks.findIndex((r) => r.atk >= minIv && r.def >= minIv && r.sta >= minIv);
                    return [source, index !== -1 ? { rank: index + 1, stat: ranks[index] } : null];
                }),
            ) as Record<Source, RankedStat | null>;
        };

        return {
            great: getBestRank(data.super, availability.super),
            ultra: getBestRank(data.hyper, availability.hyper),
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
