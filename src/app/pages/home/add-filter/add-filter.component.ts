import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterItem, FiltersFacade, ListItem } from '@repositories/filters-repository';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
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
    selectedLists = signal<ListItem[]>([]);
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

        if (!label) {
            this.toastService.prepare('❌ Erreur', 'Le label est obligatoires').showError();
            return;
        }

        const lists = this.selectedLists();

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

    // Helpers pour gérer les listes
    isListSelected(slug: string): boolean {
        return this.selectedLists().some((item) => item.key === slug);
    }

    toggleListSelection(slug: string): void {
        const lists = this.selectedLists();
        const index = lists.findIndex((item) => item.key === slug);
        if (index === -1) {
            this.selectedLists.set([...lists, { key: slug, inverted: false }]);
        } else {
            this.selectedLists.set(lists.filter((_, i) => i !== index));
        }
    }

    toggleListInversion(slug: string): void {
        const lists = this.selectedLists();
        const updated = lists.map((item) => (item.key === slug ? { ...item, inverted: !item.inverted } : item));
        this.selectedLists.set(updated);
    }
}
