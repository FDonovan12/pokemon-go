import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Signal,
    ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { ClipboardService } from '@services/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { KeepStore } from './keep-store/keep-store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon],
    templateUrl: './keep-pokemon-pages.html',
    styleUrl: './keep-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeepPokemonPages {
    readonly store = inject(KeepStore);
    readonly clipboardService = inject(ClipboardService);
    readonly filterService = inject(FilterService);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon([...this.store.selectedPokemonWantKeep()]),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon([...this.store.selectedPokemonWantKeep()]),
    );

    @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

    constructor() {
        effect(() => {
            this.store.search();
            queueMicrotask(() => this.inputRef.nativeElement.focus());
        });
    }
}
