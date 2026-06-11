import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PokemonSlug } from '@entities/pokemon';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSearchComponent } from '@shared/features/pokemon-search/pokemon-search.component.ts/pokemon-search.component';
import { SEARCH_STORE } from '@shared/features/pokemon-search/search.token';
import { ModifyRankDialogComponent } from './modify-rank-dialog/modify-rank-dialog';
import { PVPRankStore } from './pvp-rank-store/pvp-rank-store';
import { Forme, League } from './pvp-rank.type';

@Component({
    selector: 'app-pvp-rank',
    imports: [ImagePokemon, ModifyRankDialogComponent, PokemonSearchComponent],
    providers: [{ provide: SEARCH_STORE, useExisting: PVPRankStore }],
    templateUrl: './pvp-rank.html',
    styleUrl: './pvp-rank.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvpRankPages {
    protected readonly store = inject(PVPRankStore);

    selectedPokemon: PokemonSlug | null = null;
    selectedLeague: League = 'super';
    selectedForm: Forme = 'normal';
    showDialog = signal(false);

    onRankCancelled() {
        this.showDialog.set(false);
    }

    onRankSubmitted(data: { rank: number; league: League; forme: Forme }) {
        this.store.modifyRank(this.selectedPokemon!, data.rank, data.league, data.forme);
        this.showDialog.set(false);
    }

    openModifyRankDialog(pokemon: PokemonSlug, league: League = 'super', forme: Forme = 'normal') {
        this.selectedPokemon = pokemon;
        this.selectedLeague = league;
        this.selectedForm = forme;
        this.showDialog.set(true);
    }
}
