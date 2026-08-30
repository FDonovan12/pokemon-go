import { Injectable, Signal, effect, inject, signal } from '@angular/core';
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

    private readonly _resolvedFilters = signal<FilterListItemResolved[]>([]);
    private readonly _resolveGeneration = new Map<string, number>();

    constructor() {
        effect(() => {
            const currentList = this._filtersRepository.getFilters()();
            this.rebuildAndResolve(currentList);
        });
    }

    // ---------- Helpers structure (privés, remplacent les fonctions locales du fichier d'origine) ----------

    private flatten(list: FilterListItem[]): FilterItem[] {
        return list.flatMap((item) => (item.type === 'folder' ? item.children : [item]));
    }

    private needsResolution(query: FilterQuery | string): boolean {
        return typeof query !== 'string' && !!query.lists;
    }

    private resolveQuerySync(query: FilterQuery | string): string {
        if (typeof query === 'string') return query;
        return query.prefix;
    }

    /** Reconstruit la structure complète (dossiers + filtres) à partir de la liste brute et d'un résolveur par item. */
    private rebuild(
        list: FilterListItem[],
        resolveFor: (item: FilterItem) => { query: string; isCompletelyResolved: boolean },
    ): FilterListItemResolved[] {
        return list.map((item) =>
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
                          ...resolveFor(f),
                      })),
                  }
                : {
                      type: 'filter' as const,
                      id: item.id,
                      label: item.label,
                      ...resolveFor(item),
                  },
        );
    }

    /** Trouve un filtre résolu par id, en cherchant aussi dans les dossiers. */
    private findFilterResolved(filterId: string, list: FilterListItemResolved[]): FilterItemResolved | undefined {
        for (const item of list) {
            if (item.type === 'filter' && item.id === filterId) return item;
            if (item.type === 'folder') {
                const found = item.children.find((f) => f.id === filterId);
                if (found) return found;
            }
        }
        return undefined;
    }

    /** Retourne une nouvelle liste avec le filtre `filterId` mis à jour via `updater`, sans muter l'originale. */
    private updateFilterInList(
        list: FilterListItemResolved[],
        filterId: string,
        updater: (item: FilterItemResolved) => FilterItemResolved,
    ): FilterListItemResolved[] {
        return list.map((item) => {
            if (item.type === 'filter') {
                return item.id === filterId ? updater(item) : item;
            }
            return {
                ...item,
                children: item.children.map((f) => (f.id === filterId ? updater(f) : f)),
            };
        });
    }

    // ---------- Résolution ----------

    private rebuildAndResolve(list: FilterListItem[]): void {
        const flat = this.flatten(list);

        // 1. Rebuild synchrone immédiat — jamais d'attente
        const synced = this.rebuild(list, (item) => ({
            query: this.resolveQuerySync(item.query),
            isCompletelyResolved: !this.needsResolution(item.query),
        }));
        this._resolvedFilters.set(synced);

        // 2. Lancer la résolution async, filtre par filtre, indépendamment
        flat.filter((f) => this.needsResolution(f.query)).forEach((filter) => this.resolveOneFilter(filter));
    }

    private async resolveOneFilter(filter: FilterItem): Promise<void> {
        const generation = (this._resolveGeneration.get(filter.id) ?? 0) + 1;
        this._resolveGeneration.set(filter.id, generation);

        const query = await this.resolveQuery(filter.query);

        // Si le filtre a été modifié/reconstruit entre-temps, cette résolution est obsolète -> on l'ignore
        if (this._resolveGeneration.get(filter.id) !== generation) return;

        this._resolvedFilters.update((list) =>
            this.updateFilterInList(list, filter.id, (item) => ({ ...item, query, isCompletelyResolved: true })),
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

        const parts: string[] = [query.prefix];

        if (query.lists) {
            const { cleaned } = await this._filterService.cleanListCondition(query.lists);
            query.lists = cleaned;
            const pokemons = (await this._filterService.simplifyPokemon(query.lists)).sortAsc('dexNumber');
            const result = this._filterService.buildAllPokemon(pokemons);
            parts.push(result);
        }

        return parts.join(' ');
    }

    /**
     * Convertit une structure ListCondition récursive en string
     * (À implémenter plus tard)
     */
    private resolveListCondition(condition: ListCondition): string {
        // TODO: Implémenter la résolution récursive
        return '';
    }

    // ---------- API publique ----------

    isFilterResolving(filterId: string): boolean {
        const filter = this.findFilterResolved(filterId, this._resolvedFilters());
        return filter ? !filter.isCompletelyResolved : false;
    }

    getFiltersResolved(): Signal<FilterListItemResolved[]> {
        return this._resolvedFilters.asReadonly();
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

    reorderFolders(fromIndex: number, toIndex: number): void {
        this._filtersRepository.reorderFolders(fromIndex, toIndex);
    }

    reorderRootFilters(fromIndex: number, toIndex: number): void {
        this._filtersRepository.reorderRootFilters(fromIndex, toIndex);
    }
}
