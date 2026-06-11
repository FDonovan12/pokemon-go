import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterItem, FiltersFacade, ListItem } from '@repositories/filters-repository';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { ToastService } from '@shared/features/toast/toast.service';

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
    private readonly internalListPokemonRepository = inject(InternalListPokemonRepository);
    private readonly toastService = inject(ToastService);

    filterAdded = output<void>();
    filterItem = input<FilterItem>();

    showAddFilterPopup = signal(false);
    newFilterLabel = linkedSignal(() => this.filterItem()?.label ?? '');
    newFilterPrefix = linkedSignal(() => this.filterItem()?.query.prefix ?? '');
    selectedLists = linkedSignal<ListItem[]>(() => this.filterItem()?.query.lists?.items ?? []);
    listOperator = linkedSignal<'AND' | 'OR'>(() => this.filterItem()?.query.lists?.operator ?? 'AND');

    // Listes disponibles du repository
    availableLists = computed(() =>
        [this.listPokemonRepository.getListKeys(), this.internalListPokemonRepository.getInternalLists()].flat(),
    );

    openAddFilterPopup(): void {
        this.newFilterLabel.set('');
        this.newFilterPrefix.set('');
        this.selectedLists.set([]);
        this.listOperator.set('AND');
        this.showAddFilterPopup.set(true);
    }

    closeAddFilterPopup(): void {
        this.showAddFilterPopup.set(false);
    }

    addNewFilter(): void {
        const label = this.newFilterLabel().trim();
        const query = this.newFilterPrefix();

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
        if (this.filterItem()) {
            const id = this.filterItem()!.id;
            this.filtersFacade.updateFilter({ label, id, query: filterQuery });
            this.toastService.prepare('✓ Succès', `Filtre "${label}" modifié`).showSuccess();
        } else {
            this.filtersFacade.addFilter({ label, query: filterQuery });
            this.toastService.prepare('✓ Succès', `Filtre "${label}" ajouté`).showSuccess();
        }
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
