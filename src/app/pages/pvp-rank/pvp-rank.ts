import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { PokemonSlug } from '@entities/pokemon';
import { ModifyRankDialogComponent } from './modify-rank-dialog';
import { PVPRankStore } from './pvp-rank-store/pvp-rank-store';

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
    showDialog = signal(false);

    onRankCancelled() {
        this.showDialog.set(false);
    }

    onRankSubmitted(data: { rank: number; league: 'super' | 'hyper'; form: 'obscur' | 'normal' }) {
        this.store.modifyRank(this.selectedPokemon!, data.rank, data.league, data.form);
        this.showDialog.set(false);
    }

    openModifyRankDialog(pokemon: PokemonSlug) {
        this.selectedPokemon = pokemon;
        this.showDialog.set(true);
    }
}
