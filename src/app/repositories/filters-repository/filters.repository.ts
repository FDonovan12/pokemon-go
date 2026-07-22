import { inject, Injectable, linkedSignal, resource, Signal } from '@angular/core';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { SupabaseService } from '@services/supabase-service/supabase.service';
import { FilterFolder, FilterItem, FilterItemResolved, FilterListItem } from './filter.model';

export const FILTERS_STORAGE_KEY = 'user_filters';
// export const FOLDERS_STORAGE_KEY = 'user_filters_folders';

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
            type: 'filter',
            id: crypto.randomUUID(),
            label: 'IV PVP 1 ',
            query: {
                prefix: this.filterService.buildFilter({ and: ['2-pv', '2-défense', '-1attaque'] }),
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            type: 'filter',
            id: crypto.randomUUID(),
            label: 'IV PVP 2 ',
            query: {
                prefix: this.filterService.buildFilter({ and: ['3-pv', '3-défense', '-2attaque'] }),
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            type: 'filter',
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
            type: 'filter',
            id: crypto.randomUUID(),
            label: 'Filtre level 2',
            query: {
                prefix: this.onlySavagePokemons + ' & 2-attaque, -1défense, -1pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            type: 'filter',
            id: crypto.randomUUID(),
            label: 'Filtre level 3',
            query: {
                prefix: this.onlySavagePokemons + ' & 2-attaque, -2défense, -2pv & 0*, 1*, 2* & !# & âge0 & pc-100 & ',
                lists: { items: [], operator: 'AND' },
            },
        },
        {
            type: 'filter',
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

    getFilters(): Signal<FilterListItem[]> {
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

    addFolder(label: string): void {
        const newFolder: FilterFolder = { type: 'folder', id: crypto.randomUUID(), label, isOpen: true, children: [] };
        this.userFiltersSignal.set([...this.userFiltersSignal(), newFolder]);
        this.saveFilters();
    }

    updateFolder(id: string, patch: Partial<Pick<FilterFolder, 'label' | 'isOpen'>>): void {
        this.userFiltersSignal.set(
            this.userFiltersSignal().map((item) =>
                item.type === 'folder' && item.id === id ? { ...item, ...patch } : item,
            ),
        );
        this.saveFilters();
    }

    removeFolder(id: string): void {
        const list = this.userFiltersSignal();
        const folder = list.find((i) => i.id === id) as FilterFolder | undefined;
        if (!folder) return;
        // les filtres du dossier remontent à la racine, à la place du dossier
        const index = list.indexOf(folder);
        const updated = [...list];
        updated.splice(index, 1, ...folder.children);
        this.userFiltersSignal.set(updated);
        this.saveFilters();
    }

    getFilterById(filterId: string): FilterItem | undefined {
        const list = this.userFiltersSignal();
        const extracted = this.extractFilter(list, filterId);
        console.log(list);
        console.log(extracted);
        if (!extracted) return;
        const { filter, without } = extracted;
        return filter;
    }

    private extractFilter(
        list: FilterListItem[],
        filterId: string,
    ): { filter: FilterItem; without: FilterListItem[] } | null {
        const rootIndex = list.findIndex((i) => i.type !== 'folder' && i.id === filterId);
        if (rootIndex !== -1) {
            return {
                filter: list[rootIndex] as FilterItem,
                without: [...list.slice(0, rootIndex), ...list.slice(rootIndex + 1)],
            };
        }
        for (const item of list) {
            if (item.type === 'folder') {
                const idx = item.children.findIndex((f) => f.id === filterId);
                if (idx !== -1) {
                    const filter = item.children[idx];
                    const without = list.map((i) =>
                        i.id === item.id
                            ? { ...item, children: [...item.children.slice(0, idx), ...item.children.slice(idx + 1)] }
                            : i,
                    );
                    return { filter, without };
                }
            }
        }
        return null;
    }

    /** Déplace un filtre vers un nouveau conteneur (folderId ou racine) à un index donné */
    moveFilter(filterId: string, targetFolderId: string | null, newIndex: number): void {
        const list = this.userFiltersSignal();
        const extracted = this.extractFilter(list, filterId);
        if (!extracted) return;
        const { filter, without } = extracted;

        if (targetFolderId === null) {
            const updated = [...without];
            updated.splice(newIndex, 0, filter);
            this.userFiltersSignal.set(updated);
        } else {
            this.userFiltersSignal.set(
                without.map((item) => {
                    if (item.type === 'folder' && item.id === targetFolderId) {
                        const children = [...item.children];
                        children.splice(newIndex, 0, filter);
                        return { ...item, children };
                    }
                    return item;
                }),
            );
        }
        this.saveFilters();
    }

    /** Réordonne un élément à la racine (filtre ou dossier) */
    reorderRoot(fromIndex: number, toIndex: number): void {
        const list = [...this.userFiltersSignal()];
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        this.userFiltersSignal.set(list);
        this.saveFilters();
    }

    reorderInFolder(folderId: string, fromIndex: number, toIndex: number): void {
        this.userFiltersSignal.set(
            this.userFiltersSignal().map((item) => {
                if (item.type === 'folder' && item.id === folderId) {
                    const children = [...item.children];
                    const [moved] = children.splice(fromIndex, 1);
                    children.splice(toIndex, 0, moved);
                    return { ...item, children };
                }
                return item;
            }),
        );
        this.saveFilters();
    }

    getFolderById(id: string): FilterFolder | undefined {
        return this.userFiltersSignal().find((item): item is FilterFolder => item.type === 'folder' && item.id === id);
    }

    private async loadFilters(): Promise<void> {
        if (this.supabaseService.isLoggedIn()) {
            const { data } = await this.supabaseService.client.from('user_data').select('filters').single();
            this.userFiltersSignal.set((data?.filters as FilterListItem[]) ?? this.defaultFilters);
        } else {
            this.userFiltersSignal.set(
                this.localStorageService.get<FilterListItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters),
            );
        }
    }

    private readonly _filtersResource = resource({
        params: () => (this.supabaseService.isLoggedIn() ? true : undefined),
        loader: async () => {
            const { data } = await this.supabaseService.client.from('user_data').select('filters').single();
            const filterList = (data?.filters as FilterListItem[]) ?? this.defaultFilters;
            this.localStorageService.set(FILTERS_STORAGE_KEY, filterList);
            return filterList;
        },
        defaultValue: this.localStorageService.get<FilterListItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters),
    });

    // private readonly _filtersResource = resource({
    //     params: () => (this.supabaseService.isLoggedIn() ? true : undefined),
    //     loader: async () => {
    //         const { data } = await this.supabaseService.client.from('user_data').select('filters').single();
    //         const filters = (data?.filters as FilterItem[]) ?? this.defaultFilters;
    //         this.localStorageService.set(FILTERS_STORAGE_KEY, filters); // sync local avec Supabase
    //         return filters;
    //     },
    //     defaultValue: this.localStorageService.get<FilterItem[]>(FILTERS_STORAGE_KEY, this.defaultFilters),
    // });

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
