import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

const OR_JOIN = ', ';
const AND_JOIN = ' & ';
const NOT_JOIN = '!';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    // Fonction auxiliaire pour extraire une string lisible
    private stringify(elem: FilterElement): string {
        if (typeof elem === 'string') return elem;
        if (typeof elem === 'object' && 'name' in elem) return elem.name;
        return String(elem); // enum
    }

    // buildFilterString(filter: Filter): string {
    //     // Helper pour convertir un élément en string
    //     const stringify = (el: Filter): string => {
    //         if (typeof el === 'string') return el;
    //         if (typeof el === 'number') return el.toString();
    //         if (typeof el === 'object') {
    //             if ('name' in el) return el.name; // Cas PokemonInterface
    //         }
    //         return String(el); // Cas FilterKey ou fallback
    //     };

    //     if (
    //         typeof filter === 'string' ||
    //         typeof filter === 'number' ||
    //         (typeof filter === 'object' && !('and' in filter) && !('or' in filter) && !('not' in filter))
    //     ) {
    //         return stringify(filter);
    //     }

    //     if ('not' in filter) {
    //         return `${NOT_JOIN}${this.buildFilterString(filter.not)}`;
    //     }

    //     if ('or' in filter) {
    //         return filter.or.map((f) => this.buildFilterRec(f)).join(OR_JOIN);
    //     }

    //     if ('and' in filter) {
    //         return filter.and
    //             .map((f) => {
    //                 if (typeof f === 'object' && 'or' in f) {
    //                     // les OR sont prioritaires, donc on les laisse tels quels
    //                     return this.buildFilterString(f);
    //                 } else {
    //                     return this.buildFilterString(f);
    //                 }
    //             })
    //             .join(' & ');
    //     }

    //     return '';
    // }

    buildFilter(filter: Filter): string {
        return ` & ${this.buildFilterRec(filter)} & `;
    }

    buildFilterRec(filter: Filter): string {
        if (
            typeof filter === 'string'
            // (typeof filter === 'object' && 'name' in filter) ||
            // typeof filter === 'number'
        ) {
            return this.stringify(filter);
        }

        if ('not' in filter) {
            const inner = this.buildFilterRec(filter.not);
            if (inner.includes(OR_JOIN) || inner.includes(AND_JOIN)) {
                // Pas de parenthèse, donc on doit appliquer le `!` à chaque terme
                return inner
                    .split(/[,&]/)
                    .map((part) => `!${part.trim()}`)
                    .join(inner.includes(OR_JOIN) ? OR_JOIN : AND_JOIN);
            }
            return `!${inner}`;
        }

        if ('or' in filter) {
            return this.joinFilters(filter.or, OR_JOIN);
        }

        if ('and' in filter) {
            return this.joinFilters(filter.and, AND_JOIN);
        }

        throw new Error('Invalid filter structure');
    }

    private joinFilters(filters: Filter[], joiner: string) {
        return filters.map((f) => this.buildFilterRec(f)).join(joiner);
    }

    test(filter: Filter): Filter {
        const res = this.simplifyFilter(filter);
        console.log(res);
        return res;
    }

    simplifyFilter(filter: Filter): Filter {
        if (typeof filter === 'string') {
            return filter;
        }

        if ('not' in filter) {
            const inner = this.simplifyFilter(filter.not);

            if (typeof inner === 'string') {
                return { not: inner };
            }

            if ('and' in inner) {
                return {
                    or: inner.and.map((f) => this.simplifyFilter({ not: f })),
                };
            }

            if ('or' in inner) {
                return {
                    and: inner.or.map((f) => this.simplifyFilter({ not: f })),
                };
            }

            if ('not' in inner) {
                return this.simplifyFilter(inner.not); // double négation
            }
        }

        if ('and' in filter) {
            return {
                and: filter.and.map((f) => this.simplifyFilter(f)),
            };
        }

        if ('or' in filter) {
            return {
                or: filter.or.map((f) => this.simplifyFilter(f)),
            };
        }

        throw new Error('Invalid filter format');
    }
}

type FilterElement = string | PokemonInterface | FilterKey;
// type FilterElement = string;

type Filter = { and: Filter[] } | { or: Filter[] } | { not: Filter } | string;

enum FilterKey {
    éclos,
    raid,
    étude,
}
