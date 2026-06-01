import { Injectable, Signal, computed, inject } from '@angular/core';
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

    getFiltersResolved(): Signal<FilterItemResolved[]> {
        return computed(() => {
            const filters = this._filtersRepository.getFilters();

            return this.resolveFilters(filters());
        });
    }

    resolveFilters(filters: FilterItem[]): FilterItemResolved[] {
        return filters.map((filter) => ({
            label: filter.label,
            query: this.resolveQuery(filter.query),
        }));
    }

    /**
     * Convertit une requête (string ou structure) en string
     * Pour l'instant, on ignore la partie lists/pokemons
     */
    private resolveQuery(query: FilterQuery | string): string {
        if (typeof query === 'string') {
            return query;
        }

        query.prefix;
        const parts: string[] = [query.prefix];

        // TODO: Plus tard, résoudre la partie lists avec FilterService
        if (query.lists) {
            const pokemons = this._filterService.simplifyPokemon(query.lists).sortAsc('id');
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

    addFilter(filter: FilterItem): void {
        this._filtersRepository.addFilter(filter);
    }

    removeFilter(index: number): void {
        this._filtersRepository.removeFilter(index);
    }

    removeFilterByLabel(label: string): void {
        this._filtersRepository.removeFilterByLabel(label);
    }
}
