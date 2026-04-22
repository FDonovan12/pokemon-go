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
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { KeepStore } from './keep-store/keep-store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon],
    templateUrl: './keep-pokemon-pages.html',
    styleUrl: './keep-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeepPokemonPages {
    protected readonly store = inject(KeepStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly filterService = inject(FilterService);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon([...this.store.selectedPokemonWantKeep()], true),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon([...this.store.selectedPokemonWantKeep()], true),
    );

    @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

    constructor() {
        effect(() => {
            this.store.search();
            queueMicrotask(() => this.inputRef.nativeElement.focus());
        });
    }
}
