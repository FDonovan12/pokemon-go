import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KeepStore } from './keep-store/keep-store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [],
    templateUrl: './keep-pokemon-pages.html',
    styleUrl: './keep-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeepPokemonPages {
    store = inject(KeepStore);
}
