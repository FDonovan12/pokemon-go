import { ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { PokemonSlug } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSearchComponent } from '@shared/features/pokemon-search/pokemon-search.component.ts/pokemon-search.component';
import { provideSearchStore } from '@shared/features/pokemon-search/search.token';
import { ModifyRankDialogComponent } from './modify-rank-dialog/modify-rank-dialog';
import { PVPRankStore } from './pvp-rank-store/pvp-rank-store';
import { Forme, League } from './pvp-rank.type';

const _store = PVPRankStore;

@Component({
    selector: 'app-pvp-rank',
    imports: [ImagePokemon, ModifyRankDialogComponent, PokemonSearchComponent],
    providers: [provideSearchStore(_store)],
    templateUrl: './pvp-rank.html',
    styleUrl: './pvp-rank.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvpRankPages {
    protected readonly store = inject(_store);
    private readonly _pokemonRepository = inject(PokemonRepository);

    selectedPokemonSlug: WritableSignal<PokemonSlug> = signal('Bulbizarre');
    selectedPokemon = computed(() => this._pokemonRepository.getPokemonBySlug(this.selectedPokemonSlug()));
    selectedLeague: League = 'super';
    selectedForm: Forme = 'normal';
    showDialog = signal(false);

    onRankClosed() {
        this.showDialog.set(false);
    }

    openModifyRankDialog(pokemon: PokemonSlug, league: League = 'super', forme: Forme = 'normal') {
        this.selectedPokemonSlug.set(pokemon);
        this.selectedLeague = league;
        this.selectedForm = forme;
        this.showDialog.set(true);
    }
}
