import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Base, PokemonInterface } from '@entities/pokemon';
import { Combo, FilterTier, LeagueStats } from '@entities/stats';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { LogRangeComponent } from '@shared/components/log-range/log-range';
import { PokemonSearchComponent } from '@shared/features/pokemon-search/pokemon-search.component.ts/pokemon-search.component';
import { provideSearchStore } from '@shared/features/pokemon-search/search.token';
import { ModifyRankDialogComponent } from './modify-rank-dialog/modify-rank-dialog';
import { PVPRankStore } from './pvp-rank-store/pvp-rank-store';
import { Forme, League } from './pvp-rank.type';

const _store = PVPRankStore;

@Component({
    selector: 'app-pvp-rank',
    imports: [RouterOutlet, ImagePokemon, ModifyRankDialogComponent, PokemonSearchComponent, LogRangeComponent],
    providers: [provideSearchStore(_store)],
    templateUrl: './pvp-rank.html',
    styleUrl: './pvp-rank.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvpRankPages {
    protected readonly store = inject(_store);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly _filterService = inject(FilterService);
    private readonly _pokemonRepository = inject(PokemonRepository);
    private readonly _router = inject(Router);

    selectedPokemon: WritableSignal<PokemonInterface> = signal(this._pokemonRepository.getPokemonById(1)!);
    selectedLeague: League = 'super';
    selectedForm: Forme = 'normal';
    showDialog = signal(false);

    copyPokemonFilterBetterRankPVP(pokemon: PokemonInterface, league?: League) {
        const filter = this.store.getPokemonFilter(pokemon, league);
        this.clipboardService.copyToClipboard(filter, {
            message: `🏆 Filtre PVP copié pour ${pokemon.slug.titleCase()} (${filter.length} caractères)`,
        });
    }
    onRankClosed() {
        this.showDialog.set(false);
    }

    getBadge(stats: LeagueStats): '🌦️' | '🔄' | '⚔️' | '🍀' | null {
        const min = Math.min(stats.attack, stats.defense, stats.stamina);
        if (min >= 12) return '🍀';
        if (min >= 10) return '⚔️';
        if (min >= 5) return '🔄';
        if (min >= 4) return '🌦️';
        return null;
    }

    openModifyRankDialog(pokemon: PokemonInterface, league: League = 'super', forme: Forme = 'normal') {
        this.selectedPokemon.set(pokemon);
        this.selectedLeague = league;
        this.selectedForm = forme;
        this.showDialog.set(true);
    }

    copyFilter(filter: { stats: Combo<FilterTier>; pokemons: Base[]; isIncluded: boolean }, league: 'great' | 'ultra') {
        const ids = filter.pokemons.map((p) => p.dexNumber).join(',');
        const { attack, defense, stamina } = filter.stats;
        let str = '';
        if (filter.isIncluded) {
            str = `${ids}&${this._filterService.comboToFilter(filter.stats)} & !# `;
        } else {
            str = `${ids} & ${this._filterService.comboToFilterExcluded(filter.stats)} & !# `;
        }

        const message = `🏆 Filtre copié (${str.length} caractères, ${filter.pokemons.length} pokemons)`;
        this.clipboardService.copyToClipboard(str, { message });
        filter.isIncluded = !filter.isIncluded;
    }

    copyBasicFilter(filter: string): void {
        const message = filter.replaceAll('-', '\u2011');
        this.clipboardService.copyToClipboard(filter, { message });
    }

    navigateDetailPokemon(pokemon: PokemonInterface) {
        this._router.navigate(['pvp-rank', 'detail', pokemon.slug]);
    }
}
