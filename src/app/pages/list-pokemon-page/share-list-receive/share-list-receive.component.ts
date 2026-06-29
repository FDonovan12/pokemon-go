import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListLabel } from '@entities/label';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ShareDataIds, ShareListService } from '@services/share-list/share-list.service';
import { ToastService } from '@shared/features/toast/toast.service';
import { ListPokemonPageStore } from '../list-store/list-pokemon-page.store';

@Component({
    selector: 'app-share-list-receive',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './share-list-receive.component.html',

    styleUrl: './share-list-receive.component.css',
})
export class ShareListReceiveComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly shareListService = inject(ShareListService);
    private readonly listPokemonRepository = inject(ListPokemonRepository);
    private readonly pokemonRepository = inject(PokemonRepository);
    private readonly store = inject(ListPokemonPageStore);
    private readonly toastService = inject(ToastService);

    listName = '';
    isLoading = false;
    shareData: ShareDataIds | null = null;
    error: string | null = null;

    ngOnInit(): void {
        const compressedData = this.route.snapshot.paramMap.get('data');
        if (!compressedData) {
            this.error = 'Données de partage manquantes';
            return;
        }

        const data = this.shareListService.decompressShareData(compressedData);
        if (!data) {
            this.error = 'Les données de partage sont invalides ou corrompues';
            return;
        }

        this.shareData = data;
    }

    createList(): void {
        if (!this.listName.trim()) {
            this.toastService.prepare('❌ Erreur', 'Entrez un nom pour la liste').showError();
            return;
        }

        if (!this.shareData) {
            this.toastService.prepare('❌ Erreur', 'Données de partage manquantes').showError();
            return;
        }

        this.isLoading = true;
        try {
            const listLabel = this.listName.trim() as ListLabel;

            const newList = this.store.addList(listLabel);

            const ids = this.shareData.ids;
            const slugs = ids.map((id) => this.pokemonRepository.getPokemonById(id)?.slug!).compact();
            slugs.forEach((slug) => this.listPokemonRepository.addSlugToList(newList, slug));
            // this.listPokemonRepository.saveSlugsForList(newList, slugs);

            this.toastService
                .prepare('✓ Succès', `Liste "${newList}" créée avec ${slugs.length} pokémons`)
                .showSuccess();

            this.router.navigate(['/keep']);
        } catch (err) {
            this.error = 'Erreur lors de la création de la liste';
            this.toastService.prepare('❌ Erreur', this.error).showError();
        } finally {
            this.isLoading = false;
        }
    }

    cancel(): void {
        this.router.navigate(['/keep']);
    }
}
