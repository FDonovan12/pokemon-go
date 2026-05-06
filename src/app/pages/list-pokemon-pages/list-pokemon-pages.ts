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
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { ListPokemonPageStore } from './list-store/list-pokemon-page.store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon],
    templateUrl: './list-pokemon-pages.html',
    styleUrl: './list-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPokemonPages {
    protected readonly store = inject(ListPokemonPageStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly filterService = inject(FilterService);
    private readonly _pokemonRepository = inject(PokemonRepository);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon(this.store.selectedPokemonWantKeep().toList()),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon([...this.store.selectedPokemonWantKeep()]),
    );

    @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
    @ViewChild('newListName') newListNameInputRef!: ElementRef<HTMLInputElement>;

    constructor() {
        effect(() => {
            this.store.search();
            queueMicrotask(() => this.searchInputRef.nativeElement.focus());
        });
    }

    addList(newListName: string) {
        this.store.addList(newListName);
        this.newListNameInputRef.nativeElement.value = '';
    }
}
