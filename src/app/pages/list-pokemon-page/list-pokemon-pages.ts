import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    model,
    signal,
    Signal,
    ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { ListPokemonPageStore } from './list-store/list-pokemon-page.store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon, FormField],
    templateUrl: './list-pokemon-pages.html',
    styleUrl: './list-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPokemonPages {
    protected readonly store = inject(ListPokemonPageStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly filterService = inject(FilterService);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon(this.store.selectedPokemonWantKeep().toList()),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon([...this.store.selectedPokemonWantKeep()]),
    );

    @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

    search = model('');
    addListForm = form(signal({ listName: '' }));

    constructor() {
        effect(() => {
            this.store.setSearch(this.search());

            queueMicrotask(() => {
                this.searchInputRef.nativeElement.focus();
            });
        });
    }

    addList() {
        const text = this.addListForm.listName().value();
        this.store.addList(text);
        this.addListForm.listName().value.set('');
    }
}
