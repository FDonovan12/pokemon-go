import { Injectable, ResourceRef, inject, resource } from '@angular/core';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { FilterService } from '@services/filter-service/filter-service';
import { FilterItem, FilterItemResolved, FilterQuery, ListCondition } from './filter.model';
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

    getFiltersResolved(): ResourceRef<FilterItemResolved[]> {
        const defaultResolved = this._filtersRepository
            .getFilters()()
            .map((filter) => ({
                id: filter.id,
                label: filter.label,
                query: this.resolveQuerySync(filter.query),
            }));

        return resource({
            params: () => this._filtersRepository.getFilters()(),
            loader: async ({ params: filters }) => this.resolveFilters(filters),
            defaultValue: defaultResolved,
        });
    }

    async resolveFilters(filters: FilterItem[]): Promise<FilterItemResolved[]> {
        return Promise.all(
            filters.map(async (filter) => ({
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

        // TODO: Plus tard, résoudre la partie lists avec FilterService
        if (query.lists) {
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
        return this._filtersRepository
            .getFilters()()
            .find((f) => f.id === id);
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
}
