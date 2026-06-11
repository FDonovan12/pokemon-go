import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { FilterItem, FiltersFacade } from '@repositories/filters-repository';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { ToastService } from '@shared/features/toast/toast.service';

@Component({
    selector: 'app-add-filter',
    standalone: true,
    imports: [FormField],
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

    private readonly baseValue: Omit<FilterItem, 'id'> = {
        label: '',
        query: {
            prefix: '',
            lists: { items: [], operator: 'AND' },
        },
    };
    private readonly formData = linkedSignal(() => this.filterItem() ?? this.baseValue);
    protected readonly filterForm = form(this.formData, (path) => {
        required(path.label, { message: 'Le label est obligatoire' });
    });

    showAddFilterPopup = signal(false);
    availableLists = computed(() =>
        [this.listPokemonRepository.getListKeys(), this.internalListPokemonRepository.getInternalLists()].flat(),
    );

    openAddFilterPopup(): void {
        this.showAddFilterPopup.set(true);
    }

    closeAddFilterPopup(): void {
        this.filterForm().reset(this.baseValue);
        this.showAddFilterPopup.set(false);
    }

    addNewFilter(): void {
        this.filterForm().markAsTouched();
        const label = this.filterForm().value().label;

        if (this.filterItem()) {
            const id = this.filterItem()!.id;
            this.filtersFacade.updateFilter({ id, ...this.filterForm().value() });
            this.toastService.prepare('✓ Succès', `Filtre "${label}" modifié`).showSuccess();
        } else {
            this.filtersFacade.addFilter(this.filterForm().value());
            this.toastService.prepare('✓ Succès', `Filtre "${label}" ajouté`).showSuccess();
        }
        this.closeAddFilterPopup();
        this.filterAdded.emit();
    }

    isListSelected(slug: string): boolean {
        const rezult = this.filterForm()
            .value()
            .query.lists!.items.some((item) => item.key === slug);
        return rezult;
    }
    toggleListSelection(slug: string): void {
        this.formData.update((d) => {
            const clone = structuredClone(d);
            const items = clone.query.lists.items;
            const index = items.findIndex((item) => item.key === slug);
            clone.query.lists!.items =
                index === -1 ? [...items, { key: slug, inverted: false }] : items.filter((_, i) => i !== index);
            return clone;
        });
    }

    toggleListInversion(slug: string): void {
        this.formData.update((d) => {
            const clone = structuredClone(d);
            clone.query.lists!.items = d.query.lists.items.map((item) =>
                item.key === slug ? { ...item, inverted: !item.inverted } : item,
            );
            return clone;
        });
    }
}
