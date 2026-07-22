import { Injectable, ResourceRef, inject, resource } from '@angular/core';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import {
    FilterFolder,
    FilterFolderResolved,
    FilterItem,
    FilterItemResolved,
    FilterListItem,
    FilterListItemResolved,
    FilterQuery,
    ListCondition,
} from './filter.model';
import { FiltersRepository } from './filters.repository';

@Injectable({
    providedIn: 'root',
})
export class FiltersFacade {
    private readonly _filterService = inject(FilterService);
    private readonly _filtersRepository = inject(FiltersRepository);
    private readonly _listPokemonRepository = inject(ListPokemonRepository);
    private readonly _pokemonRepository = inject(PokemonRepository);

    private resolveQuerySync(query: FilterQuery | string): string {
        if (typeof query === 'string') return query;
        return query.prefix;
    }

    getFiltersResolved(): ResourceRef<FilterListItemResolved[]> {
        const flatten = (list: FilterListItem[]): FilterItem[] =>
            list.flatMap((item) => (item.type === 'folder' ? item.children : [item]));

        const rebuild = (list: FilterListItem[], resolvedQueryById: Map<string, string>): FilterListItemResolved[] =>
            list.map((item) =>
                item.type === 'folder'
                    ? {
                          type: 'folder' as const,
                          id: item.id,
                          label: item.label,
                          isOpen: item.isOpen,
                          children: item.children.map((f) => ({
                              type: 'filter' as const,
                              id: f.id,
                              label: f.label,
                              query: resolvedQueryById.get(f.id) ?? '',
                          })),
                      }
                    : {
                          type: 'filter' as const,
                          id: item.id,
                          label: item.label,
                          query: resolvedQueryById.get(item.id) ?? '',
                      },
            );

        const currentList = this._filtersRepository.getFilters()();
        const defaultResolvedMap = new Map(flatten(currentList).map((f) => [f.id, this.resolveQuerySync(f.query)]));

        return resource({
            params: () => this._filtersRepository.getFilters()(),
            loader: async ({ params: filterList }) => {
                const resolvedFlat = await this.resolveFilters(flatten(filterList));
                const resolvedMap = new Map(resolvedFlat.map((f) => [f.id, f.query]));
                return rebuild(filterList, resolvedMap);
            },
            defaultValue: rebuild(currentList, defaultResolvedMap),
        });
    }

    async resolveFilters(filters: FilterItem[]): Promise<FilterItemResolved[]> {
        return Promise.all(
            filters.map(async (filter) => ({
                type: 'filter',
                id: filter.id,
                label: filter.label,
                query: await this.resolveQuery(filter.query),
            })),
        );
    }

    /**
     * Convertit une requête (string ou structure) en string
     * Pour l'instant, on ignore la partie lists/pokemons
     */
    private async resolveQuery(query: FilterQuery | string): Promise<string> {
        if (typeof query === 'string') {
            return query;
        }

        query.prefix;
        const parts: string[] = [query.prefix];

        if (query.lists) {
            const { cleaned, removedKeys } = await this._filterService.cleanListCondition(query.lists);
            query.lists = cleaned;
            const pokemons = (await this._filterService.simplifyPokemon(query.lists)).sortAsc('id');
            const result = this._filterService.buildAllPokemon(pokemons);
            parts.push(result);
        }

        return parts.join(' ');
    }

    /**
     * Convertit une structure ListCondition récursive en string
     * (À implémente plus tard)
     */
    private resolveListCondition(condition: ListCondition): string {
        // TODO: Implémenter la résolution récursive
        return '';
    }

    getFilterById(id: string): FilterItem | undefined {
        return this._filtersRepository.getFilterById(id);
    }

    addFilter(filter: Omit<FilterItem, 'id'>): void {
        this._filtersRepository.addFilter(filter);
    }

    updateFilter(filter: FilterItem): void {
        this._filtersRepository.updateFilter(filter);
    }

    removeFilter(filter: FilterItemResolved | FilterItem): void {
        this._filtersRepository.removeFilter(filter);
    }

    removeFilterByLabel(label: string): void {
        this._filtersRepository.removeFilterByLabel(label);
    }

    addFolder(label: string): void {
        this._filtersRepository.addFolder(label);
    }

    toggleFolder(folder: FilterFolderResolved): void {
        this._filtersRepository.updateFolder(folder.id, { isOpen: !folder.isOpen });
    }

    removeFolder(id: string): void {
        this._filtersRepository.removeFolder(id);
    }

    moveFilter(filterId: string, targetFolderId: string | null, newIndex: number): void {
        this._filtersRepository.moveFilter(filterId, targetFolderId, newIndex);
    }

    reorderRoot(fromIndex: number, toIndex: number): void {
        this._filtersRepository.reorderRoot(fromIndex, toIndex);
    }

    reorderInFolder(folderId: string, fromIndex: number, toIndex: number): void {
        this._filtersRepository.reorderInFolder(folderId, fromIndex, toIndex);
    }

    getFolderById(id: string): FilterFolder | undefined {
        return this._filtersRepository.getFolderById(id);
    }

    updateFolder(id: string, newFolder: { label: string }) {
        this._filtersRepository.updateFolder(id, newFolder);
    }
}
