import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { ShareListService } from '@services/share-list/share-list.service';
import { ToastService } from 'app/shared/features/toast/toast.service';
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
    private readonly store = inject(ListPokemonPageStore);
    private readonly toastService = inject(ToastService);

    listName = '';
    isLoading = false;
    shareData: { slugs: string[] } | null = null;
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
            const listKey = this.listName.trim();

            // Sauvegarder les slugs pour cette liste
            const slugs = this.shareData.slugs as any;
            this.listPokemonRepository.saveSlugsForList(listKey, slugs);

            // Ajouter la clé à la liste des clés si elle n'existe pas
            const keys = this.listPokemonRepository.getListKeys();
            if (!keys.includes(listKey)) {
                this.listPokemonRepository.saveListKeys([...keys, listKey]);
            }

            // Mettre à jour le store pour afficher la nouvelle liste
            this.store.addList(listKey);

            this.toastService
                .prepare('✓ Succès', `Liste "${listKey}" créée avec ${this.shareData.slugs.length} pokémons`)
                .showSuccess();

            // Rediriger vers la page keep après un délai
            setTimeout(() => {
                this.router.navigate(['/keep']);
            }, 1500);
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
