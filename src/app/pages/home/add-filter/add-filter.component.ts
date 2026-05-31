import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterItem, FiltersFacade } from '@repositories/filters-repository';
import { ListKey, ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { ToastService } from 'app/shared/features/toast/toast.service';

@Component({
    selector: 'app-add-filter',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './add-filter.component.html',
    styleUrl: './add-filter.component.css',
})
export class AddFilterComponent {
    private readonly filtersFacade = inject(FiltersFacade);
    private readonly listPokemonRepository = inject(ListPokemonRepository);
    private readonly toastService = inject(ToastService);

    @Output() filterAdded = new EventEmitter<void>();

    showAddFilterPopup = signal(false);
    newFilterLabel = signal('');
    newFilterQuery = signal('');
    selectedLists = signal<ListKey[]>([]);
    listOperator = signal<'AND' | 'OR'>('AND');

    // Listes disponibles du repository
    availableLists = computed(() => this.listPokemonRepository.getListKeys());

    openAddFilterPopup(): void {
        this.newFilterLabel.set('');
        this.newFilterQuery.set('');
        this.selectedLists.set([]);
        this.listOperator.set('AND');
        this.showAddFilterPopup.set(true);
    }

    closeAddFilterPopup(): void {
        this.showAddFilterPopup.set(false);
    }

    addNewFilter(): void {
        const label = this.newFilterLabel().trim();
        const query = this.newFilterQuery();

        if (!label || !query) {
            this.toastService.prepare('❌ Erreur', 'Le label et la requête sont obligatoires').showError();
            return;
        }

        const lists = this.selectedLists();
        if (lists.length === 0) {
            this.toastService.prepare('❌ Erreur', 'Sélectionnez au moins une liste').showError();
            return;
        }

        const filterQuery: FilterItem['query'] = {
            prefix: query,
            lists: {
                operator: this.listOperator(),
                items: lists,
            },
        };

        this.filtersFacade.addFilter({ label, query: filterQuery });
        this.toastService.prepare('✓ Succès', `Filtre "${label}" ajouté`).showSuccess();
        this.closeAddFilterPopup();
        this.filterAdded.emit();
    }
}
