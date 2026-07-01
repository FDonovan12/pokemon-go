import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { Base, PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
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
    print(pokemon: PokemonInterface) {
        console.log(pokemon);
        console.log();
        this.clipboardService.copyToClipboard(this.store.getPokemonFilter(pokemon.slug));
    }
    protected readonly store = inject(_store);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly _pokemonRepository = inject(PokemonRepository);
    protected readonly console = console;

    selectedPokemon: WritableSignal<PokemonInterface> = signal(this._pokemonRepository.getPokemonById(1)!);
    selectedLeague: League = 'super';
    selectedForm: Forme = 'normal';
    showDialog = signal(false);

    onRankClosed() {
        this.showDialog.set(false);
    }

    openModifyRankDialog(pokemon: PokemonInterface, league: League = 'super', forme: Forme = 'normal') {
        this.selectedPokemon.set(pokemon);
        this.selectedLeague = league;
        this.selectedForm = forme;
        this.showDialog.set(true);
    }

    copyFilter(filter: { stats: any; pokemons: Base[]; isIncluded: boolean }, league: 'great' | 'ultra') {
        const ids = filter.pokemons.map((p) => p.dexNumber).join(',');
        const { atq, def, stamina } = filter.stats;
        let str = '';
        if (filter.isIncluded) {
            str = `${ids}&${atq}attaque&${def}défense&${stamina}pv & !# `;
        } else {
            const allStats = [0, 1, 2, 3, 4];
            const allAtq = allStats
                .filter((stat) => stat !== atq)
                .map((atq) => atq + 'attaque')
                .join(',');
            const allDef = allStats
                .filter((stat) => stat !== def)
                .map((def) => def + 'défense')
                .join(',');
            const allStamina = allStats
                .filter((stat) => stat !== stamina)
                .map((stamina) => stamina + 'pv')
                .join(',');
            str = `${ids} & ${allAtq}, ${allDef}, ${allStamina} & !# `;
        }
        this.clipboardService.copyToClipboard(str);
        filter.isIncluded = !filter.isIncluded;
    }
}
