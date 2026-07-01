import { inject, Injectable, linkedSignal, resource, Signal } from '@angular/core';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { SupabaseService } from '@services/supabase-service/supabase.service';
import { FilterItem, FilterItemResolved } from './filter.model';

export const FILTERS_STORAGE_KEY = 'user_filters';

@Injectable({
    providedIn: 'root',
})
export class FiltersRepository {
    private readonly filterService = inject(FilterService);
    private readonly localStorageService = inject(LocalStorageService);
    private readonly pokemonRepository = inject(PokemonRepository);
    private readonly supabaseService = inject(SupabaseService);

    private readonly onlySavagePokemons = ' & !raid & !éclos & !étude & !dynamax & !gigamax & ';

    private readonly defaultFilters: FilterItem[] = [
        {
            id: crypto.randomUUID(),
            label: 'IV PVP 1 ',
            query: {
                prefix: this.filterService.buildFilter({ and: ['2-pv', '2-défense', '-1attaque'] }),
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            id: crypto.randomUUID(),
            label: 'IV PVP 2 ',
            query: {
                prefix: this.filterService.buildFilter({ and: ['3-pv', '3-défense', '-2attaque'] }),
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            id: crypto.randomUUID(),
            label: 'Filtre level 1',
            query: {
                prefix:
                    this.onlySavagePokemons +
                    ' & 2-attaque, -1défense & 2-attaque, -1pv & -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            id: crypto.randomUUID(),
            label: 'Filtre level 2',
            query: {
                prefix: this.onlySavagePokemons + ' & 2-attaque, -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            id: crypto.randomUUID(),
            label: 'Filtre level 3',
            query: {
                prefix: this.onlySavagePokemons + ' & 2-attaque, -2défense, -2pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            id: crypto.randomUUID(),
            label: 'Filtre level 4',
            query: {
                prefix: this.onlySavagePokemons + ' & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
    ];

    // private userFiltersSignal = signal<FilterItem[]>([]);
    readonly userFiltersSignal = linkedSignal(() => this._filtersResource.value());

    constructor() {
        this.loadFilters();
    }

    getFilters(): Signal<FilterItem[]> {
        return this.userFiltersSignal.asReadonly();
    }

    addFilter(filter: Omit<FilterItem, 'id'>): void {
        const currentFilters = this.userFiltersSignal();
        const newFilter = { ...filter, id: crypto.randomUUID() };
        this.userFiltersSignal.set([...currentFilters, newFilter]);
        this.saveFilters();
    }

    updateFilter(filter: FilterItem): void {
        const currentFilters = this.userFiltersSignal();
        const afterUpdate = currentFilters.map((f) => {
            if (f.id === filter.id) {
                return filter;
            } else {
                return f;
            }
        });
        this.userFiltersSignal.set(afterUpdate);
        this.saveFilters();
    }

    removeFilter(filter: FilterItemResolved | FilterItem): void {
        const currentFilters = this.userFiltersSignal();
        const updatedFilters = currentFilters.filter((f) => f.id !== filter.id);
        this.userFiltersSignal.set(updatedFilters);
        this.saveFilters();
    }

    removeFilterByLabel(label: string): void {
        const currentFilters = this.userFiltersSignal();
        const updatedFilters = currentFilters.filter((filter) => filter.label !== label);
        this.userFiltersSignal.set(updatedFilters);
        this.saveFilters();
    }

    private async loadFilters(): Promise<void> {
        if (this.supabaseService.isLoggedIn()) {
            const { data } = await this.supabaseService.client.from('user_data').select('filters').single();
            this.userFiltersSignal.set((data?.filters as FilterItem[]) ?? this.defaultFilters);
        } else {
            const savedFilters = this.localStorageService.get<FilterItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters);
            this.userFiltersSignal.set(savedFilters);
        }
    }

    private readonly _filtersResource = resource({
        params: () => (this.supabaseService.isLoggedIn() ? true : undefined),
        loader: async () => {
            const { data } = await this.supabaseService.client.from('user_data').select('filters').single();
            const filters = (data?.filters as FilterItem[]) ?? this.defaultFilters;
            this.localStorageService.set(FILTERS_STORAGE_KEY, filters); // sync local avec Supabase
            return filters;
        },
        defaultValue: this.localStorageService.get<FilterItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters),
    });

    private async saveFilters(): Promise<void> {
        this.localStorageService.set(FILTERS_STORAGE_KEY, this.userFiltersSignal());

        if (this.supabaseService.isLoggedIn()) {
            const userId = this.supabaseService.getUserId();
            await this.supabaseService.client
                .from('user_data')
                .upsert({ user_id: userId, filters: this.userFiltersSignal() }, { onConflict: 'user_id' });
        }
    }

    resetUserFilters(): void {
        this.userFiltersSignal.set([]);
        this.saveFilters();
    }
}
