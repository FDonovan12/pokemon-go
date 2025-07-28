import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

const OR_JOIN = ', ';
const AND_JOIN = ' & ';
const NOT_JOIN = '!';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private stringify(elem: FilterElement): string {
        if (typeof elem === 'string') return elem;
        if (typeof elem === 'object' && 'name' in elem) return elem.name;
        return String(elem); // enum
    }

    buildAllPokemon(pokemons: PokemonInterface[]): string {
        const filter = { or: pokemons };
        return this.buildFilter(filter);
    }

    buildNeitherPokemon(pokemons: PokemonInterface[]): string {
        const filter = { not: { and: pokemons } };
        return this.buildFilter(filter);
    }

    buildFilter(filter: Filter): string {
        return `${this.buildFilterRec(filter)}`;
    }

    buildFilterRec(filter: Filter): string {
        if (this.isFilterElement(filter)) {
            return this.stringify(filter);
        }

        if (this.isNot(filter)) {
            const inner = this.buildFilterRec(filter.not);
            if (inner.includes(OR_JOIN) || inner.includes(AND_JOIN)) {
                return inner
                    .split(/[,&]/)
                    .map((part) => `!${part.trim()}`)
                    .join(inner.includes(OR_JOIN) ? OR_JOIN : AND_JOIN);
            }
            return `!${inner}`;
        }

        if (this.isOr(filter)) {
            return this.joinFilters(filter.or, OR_JOIN);
        }

        if (this.isAnd(filter)) {
            return this.joinFilters(filter.and, AND_JOIN);
        }

        throw new Error('Invalid filter structure');
    }

    private joinFilters(filters: Filter[], joiner: string) {
        return filters.map((f) => this.buildFilterRec(f)).join(joiner);
    }

    buildSimplyFilter(filter: Filter): string {
        const simplifyFilterRes = this.simplifyFilter(filter);
        const stringResult = this.buildFilter(simplifyFilterRes);
        return stringResult;
    }

    test(filter: Filter): Filter {
        const res = this.simplifyFilter(filter);
        console.log(res);
        return res;
    }

    simplifyFilter(filter: Filter): Filter {
        if (this.isFilterElement(filter)) {
            return filter;
        }

        if (this.isNot(filter)) {
            const inner = this.simplifyFilter(filter.not);

            if (this.isFilterElement(inner)) {
                return { not: inner };
            }

            if (this.isAnd(inner)) {
                return {
                    or: inner.and.map((f) => this.simplifyFilter({ not: f })),
                };
            }

            if (this.isOr(inner)) {
                return {
                    and: inner.or.map((f) => this.simplifyFilter({ not: f })),
                };
            }

            if (this.isNot(inner)) {
                return this.simplifyFilter(inner.not); // double négation
            }
        }

        if (this.isAnd(filter)) {
            return {
                and: filter.and.map((f) => this.simplifyFilter(f)),
            };
        }

        if (this.isOr(filter)) {
            return {
                or: filter.or.map((f) => this.simplifyFilter(f)),
            };
        }

        throw new Error('Invalid filter format');
    }

    private isFilterElement(filter: Filter): filter is FilterElement {
        return typeof filter === 'string' || (typeof filter === 'object' && 'name' in filter);
    }

    private isNot(filter: Filter): filter is { not: Filter } {
        return typeof filter === 'object' && filter !== null && 'not' in filter;
    }

    private isAnd(filter: Filter): filter is { and: Filter[] } {
        return typeof filter === 'object' && filter !== null && 'and' in filter;
    }

    private isOr(filter: Filter): filter is { or: Filter[] } {
        return typeof filter === 'object' && filter !== null && 'or' in filter;
    }
}

type FilterElement = string | PokemonInterface;
// type FilterElement = string;

type Filter = { and: Filter[] } | { or: Filter[] } | { not: Filter } | FilterElement;

enum FilterKey {
    éclos,
    raid,
    étude,
}
