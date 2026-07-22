import { Component, HostListener, inject, input, linkedSignal, resource } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { FilterItem, FiltersFacade } from '@repositories/filters-repository';
import { InternalListPokemonRepository } from '@repositories/list-pokemon-repository/internal-list-pokemon.repository';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { ToastService } from '@shared/features/toast/toast.service';

@Component({
    selector: 'app-add-filter',
    standalone: true,
    imports: [FormField],
    templateUrl: './add-filter.page.html',
    styleUrl: './add-filter.page.css',
})
export class AddFilterPage {
    private readonly router = inject(Router);
    private readonly filtersFacade = inject(FiltersFacade);
    private readonly listPokemonRepository = inject(ListPokemonRepository);
    private readonly internalListPokemonRepository = inject(InternalListPokemonRepository);
    private readonly toastService = inject(ToastService);

    readonly filter = input<FilterItem | undefined>();

    private readonly baseValue: Omit<FilterItem, 'id'> = {
        type: 'filter',
        label: '',
        query: {
            prefix: '',
            lists: { items: [], operator: 'AND' },
        },
    };

    private readonly formData = linkedSignal(() => this.filter() ?? this.baseValue);
    protected readonly filterForm = form(this.formData, (path) => {
        required(path.label, { message: 'Le label est obligatoire' });
    });

    availableLists = resource({
        loader: async () => {
            const keys = await this.listPokemonRepository.getListKeys();
            return [keys, this.internalListPokemonRepository.getInternalLists()].flat();
        },
        defaultValue: [],
    });

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.cancel();
        }
    }

    cancel(): void {
        this.router.navigate(['/']);
    }

    save(): void {
        this.filterForm().markAsTouched();
        if (this.filterForm().invalid()) return;

        const label = this.filterForm().value().label;
        const existing = this.filter();

        if (existing) {
            this.filtersFacade.updateFilter({ id: existing.id, ...this.filterForm().value() });
            this.toastService.prepare('✓ Succès', `Filtre "${label}" modifié`).showSuccess();
        } else {
            this.filtersFacade.addFilter(this.filterForm().value());
            this.toastService.prepare('✓ Succès', `Filtre "${label}" ajouté`).showSuccess();
        }
        this.router.navigate(['/']);
    }

    isListSelected(slug: string): boolean {
        return this.filterForm()
            .value()
            .query.lists!.items.some((item) => item.key === slug);
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
