import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { generationsPokemon } from '@entities/pokemon';
import { SwipeGestureDirective } from '@shared/directive/swipe-gesture.directive';
import { SEARCH_STORE, WithSearch } from '../search.token';

@Component({
    selector: 'app-pokemon-search',
    imports: [FormsModule, ReactiveFormsModule, SwipeGestureDirective],
    templateUrl: './pokemon-search.component.html',
    styleUrl: './pokemon-search.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSearchComponent {
    protected readonly store: WithSearch = inject(SEARCH_STORE);

    searchInputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

    search = this.store.search;
    generations = generationsPokemon;

    constructor() {
        afterNextRender(() => {
            this.searchInputRef().nativeElement.focus();
        });
    }

    reset() {
        this.store.setSearch('');
        this.searchInputRef().nativeElement.focus();
    }
}
