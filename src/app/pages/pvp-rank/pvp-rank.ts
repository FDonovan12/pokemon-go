import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { PokemonSlug } from '@entities/pokemon';
import { ModifyRankDialogComponent } from './modify-rank-dialog/modify-rank-dialog';
import { PVPRankStore } from './pvp-rank-store/pvp-rank-store';

export type League = 'super' | 'hyper';
export type Form = 'normal' | 'obscur';
@Component({
    selector: 'app-pvp-rank',
    imports: [ImagePokemon, ModifyRankDialogComponent],
    templateUrl: './pvp-rank.html',
    styleUrl: './pvp-rank.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvpRankPages {
    protected readonly store = inject(PVPRankStore);

    selectedPokemon: PokemonSlug | null = null;
    selectedLeague: League = 'super';
    selectedForm: Form = 'normal';
    showDialog = signal(false);

    onRankCancelled() {
        this.showDialog.set(false);
    }

    onRankSubmitted(data: { rank: number; league: League; form: Form }) {
        this.store.modifyRank(this.selectedPokemon!, data.rank, data.league, data.form);
        this.showDialog.set(false);
    }

    openModifyRankDialog(pokemon: PokemonSlug, league: League = 'super', form: Form = 'normal') {
        this.selectedPokemon = pokemon;
        this.selectedLeague = league;
        this.selectedForm = form;
        this.showDialog.set(true);
    }
}
