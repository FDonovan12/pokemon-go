import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ShareListService } from '@services/share-list/share-list.service';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSearchComponent } from '@shared/features/pokemon-search/pokemon-search.component.ts/pokemon-search.component';
import { SEARCH_STORE } from '@shared/features/pokemon-search/search.token';
import { ToastService } from '@shared/features/toast/toast.service';
import { ListPokemonPageStore } from './list-store/list-pokemon-page.store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon, FormField, PokemonSearchComponent],
    providers: [{ provide: SEARCH_STORE, useExisting: ListPokemonPageStore }],
    templateUrl: './list-pokemon-pages.html',
    styleUrl: './list-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPokemonPages {
    protected readonly store = inject(ListPokemonPageStore);
    protected readonly clipboardService = inject(ClipboardService);
    private readonly filterService = inject(FilterService);
    private readonly shareListService = inject(ShareListService);
    private readonly toastService = inject(ToastService);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon(this.store.selectedPokemonWantKeep().toList()),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon(this.store.selectedPokemonWantKeep().toList()),
    );

    addListForm = form(signal({ listName: '' }));

    addList() {
        const text = this.addListForm.listName().value();
        this.store.addList(text);
        this.addListForm.listName().value.set('');
    }

    shareList(): void {
        const pokemons = this.store.selectedPokemonWantKeep().toList();
        if (pokemons.length === 0) {
            this.toastService.prepare('❌ Erreur', 'Aucun pokémon sélectionné').showError();
            return;
        }

        const ids = pokemons.map((p) => p.id);
        const shareUrl = this.shareListService.generateShareUrl(ids);

        this.clipboardService.copyToClipboard(shareUrl);
        this.toastService.prepare('✓ Succès', `Lien copié! ${pokemons.length} pokémons à partager`).showSuccess();
    }
}
