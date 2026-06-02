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
import { Router } from '@angular/router';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { FilterService } from '@services/filter-service/filter-service';
import { ShareListService } from '@services/share-list/share-list.service';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { ToastService } from 'app/shared/features/toast/toast.service';
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
    private readonly shareListService = inject(ShareListService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    filterAll: Signal<string> = computed(() =>
        this.filterService.buildAllPokemon(this.store.selectedPokemonWantKeep().toList()),
    );
    filterNeither: Signal<string> = computed(() =>
        this.filterService.buildNeitherPokemon(this.store.selectedPokemonWantKeep().toList()),
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

    shareList(): void {
        const pokemons = this.store.selectedPokemonWantKeep().toList();
        if (pokemons.length === 0) {
            this.toastService.prepare('❌ Erreur', 'Aucun pokémon sélectionné').showError();
            return;
        }

        const slugs = pokemons.map((p) => p.slug);
        const shareUrl = this.shareListService.generateShareUrl(slugs);

        this.clipboardService.copyToClipboard(shareUrl);
        this.toastService.prepare('✓ Succès', `Lien copié! ${pokemons.length} pokémons à partager`).showSuccess();
    }
}
