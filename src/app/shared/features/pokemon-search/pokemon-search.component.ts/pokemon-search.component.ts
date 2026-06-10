import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, model, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SEARCH_STORE, WithSearch } from '../search.token';

@Component({
    selector: 'app-pokemon-search',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './pokemon-search.component.html',
    styleUrl: './pokemon-search.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSearchComponent {
    protected readonly store: WithSearch = inject(SEARCH_STORE);

    @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

    search = model('');

    constructor() {
        effect(() => {
            this.store.setSearch(this.search());

            queueMicrotask(() => {
                this.searchInputRef.nativeElement.focus();
            });
        });
    }
}
