import { inject, Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ListCondition } from './../../repositories/filters-repository/filter.model';

const OR_JOIN = ',';
const AND_JOIN = '&';
const NOT_JOIN = '!';
type Combo = {
    atq: number;
    def: number;
    stamina: number;
};
type Range = { min: number; max: number };
type GroupedCombo = { atq: Range; def: Range; stamina: Range };
type StatKey = 'atq' | 'def' | 'stamina';

type RangeWithStat = {
    stat: StatKey;
    range: Range;
};
@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private comboToTerms(combo: GroupedCombo): RangeWithStat[] {
        return [
            { stat: 'atq', range: combo.atq },
            { stat: 'def', range: combo.def },
            { stat: 'stamina', range: combo.stamina },
        ];
    }
    private comboToGrouped(combo: Combo): GroupedCombo {
        return {
            atq: { min: combo.atq, max: combo.atq },
            def: { min: combo.def, max: combo.def },
            stamina: { min: combo.stamina, max: combo.stamina },
        };
    }
    private equalsRange(a: Range, b: Range): boolean {
        return a.min === b.min && a.max === b.max;
    }
    private canMerge(a: GroupedCombo, b: GroupedCombo): boolean {
        let diff = 0;
        const dims: (keyof GroupedCombo)[] = ['atq', 'def', 'stamina'];
        for (const dim of dims) {
            if (!this.equalsRange(a[dim], b[dim])) diff++;
        }
        if (diff !== 1) return false;

        // la dimension différente doit être adjacente
        const dim = dims.find((d) => !this.equalsRange(a[d], b[d]))!;
        const ra = a[dim],
            rb = b[dim];
        return ra.max + 1 === rb.min || rb.max + 1 === ra.min;
    }
    private readonly statSuffix: Record<StatKey, string> = {
        atq: 'attaque',
        def: 'défense',
        stamina: 'pv',
    };
    private formatRange = (r: RangeWithStat): string => {
        const suffix = this.statSuffix[r.stat];
        return r.range.min === r.range.max ? `${r.range.min}${suffix}` : `${r.range.min}-${r.range.max}${suffix}`;
    };
    private merge(a: GroupedCombo, b: GroupedCombo): GroupedCombo {
        const dims: (keyof GroupedCombo)[] = ['atq', 'def', 'stamina'];
        const result = {} as GroupedCombo;
        for (const dim of dims) {
            result[dim] = {
                min: Math.min(a[dim].min, b[dim].min),
                max: Math.max(a[dim].max, b[dim].max),
            };
        }
        return result;
    }
    buildComboFilter(combos: Combo[]): string {
        console.log(combos);
        let groups: GroupedCombo[] = combos.map((c) => this.comboToGrouped(c));

        let changed = true;

        while (changed) {
            changed = false;
            const next: GroupedCombo[] = [];
            const used = new Array(groups.length).fill(false);

            for (let i = 0; i < groups.length; i++) {
                if (used[i]) continue;

                let merged = false;

                for (let j = i + 1; j < groups.length; j++) {
                    if (used[j]) continue;

                    if (this.canMerge(groups[i], groups[j])) {
                        next.push(this.merge(groups[i], groups[j]));
                        used[i] = true;
                        used[j] = true;
                        merged = true;
                        changed = true;
                        break;
                    }
                }

                if (!merged && !used[i]) {
                    next.push(groups[i]);
                }
            }

            groups = next;
        }
        console.log(groups);
        return this.buildComboFilterClause(groups);
    }
    private buildComboFilterClause(combos: GroupedCombo[]): string {
        console.log(combos);
        if (combos.length === 0) {
            return '';
        }

        // Chaque combo devient un tableau de termes
        const groups = combos.map(this.comboToTerms);

        // Produit cartésien des groupes
        let result: RangeWithStat[][] = [[]];

        for (const group of groups) {
            const next: RangeWithStat[][] = [];

            for (const partial of result) {
                for (const term of group) {
                    next.push([...partial, term]);
                }
            }

            result = next;
        }

        // Chaque combinaison devient un OR
        return result.map((clause) => this.filterRedundantRanges(clause).map(this.formatRange).join(', ')).join(' & ');
    }
    private filterRedundantRanges(ranges: RangeWithStat[]): RangeWithStat[] {
        return ranges.filter((r) => {
            // garde r seulement si aucune autre range de même stat ne le contient entièrement
            return !ranges.some(
                (other) =>
                    other !== r &&
                    other.stat === r.stat &&
                    other.range.min <= r.range.min &&
                    other.range.max >= r.range.max &&
                    (other.range.min < r.range.min || other.range.max > r.range.max), // other est strictement plus large
            );
        });
    }

    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);
    private readonly _listPokemonRepository: ListPokemonRepository = inject(ListPokemonRepository);

    private stringify(elem: FilterElement): string {
        if (typeof elem === 'string') return elem;
        if (typeof elem === 'object' && 'name' in elem) return elem.name;
        return String(elem); // enum
    }

    buildAllPokemonFamily(pokemons: PokemonInterface[], withFamily: boolean = false): string {
        const filter: Filter = { or: pokemons.sortAsc('id') };
        if (withFamily) {
            filter.or = pokemons.map((pokemon) => '+' + pokemon.name);
        }
        return this.buildFilter(filter);
    }

    buildNeitherPokemonFamily(pokemons: PokemonInterface[], withFamily: boolean = false): string {
        const filter: Filter = { not: { and: pokemons.sortAsc('id') } };
        if (withFamily) {
            filter.not = { and: pokemons.map((pokemon) => '+' + pokemon.name) };
        }
        return this.buildFilter(filter);
    }

    async cleanListCondition(lists: ListCondition): Promise<{ cleaned: ListCondition; removedKeys: string[] }> {
        const checks = await Promise.all(
            lists.items.map(async (item) => ({
                item,
                exists: await this._listPokemonRepository.listExists({ slug: item.key }),
            })),
        );

        const removedKeys = checks.filter((c) => !c.exists).map((c) => c.item.key);
        const items = checks.filter((c) => c.exists).map((c) => c.item);

        return { cleaned: { ...lists, items }, removedKeys };
    }

    async simplifyPokemon(lists: ListCondition): Promise<PokemonInterface[]> {
        const { cleaned, removedKeys } = await this.cleanListCondition(lists);

        const pokemonsLists = await Promise.all(
            cleaned.items.map(async (item) => {
                const pokemons = await this._listPokemonRepository.getPokemonsForList({ slug: item.key });
                if (item.inverted) {
                    return this._pokemonRepository.getAllOtherPokemons(pokemons);
                } else {
                    return pokemons;
                }
            }),
        );
        if (lists.operator === 'AND') {
            if (pokemonsLists.length === 0) return [];
            return pokemonsLists.reduce((acc, pokemons) =>
                acc.filter((pokemon) => pokemon.slug.slugifyIn(pokemons.map((pokemon) => pokemon.slug))),
            );
        } else {
            return pokemonsLists.flat().unique();
        }
    }

    buildAllPokemon(pokemons: PokemonInterface[]): string {
        const filter: Filter = { or: pokemons.sortAsc('id').map((pokemon) => '' + pokemon.id) };
        return this.buildFilter(filter);
    }

    buildNeitherPokemon(pokemons: PokemonInterface[]): string {
        const allOtherPokemons = this._pokemonRepository.getAllOtherPokemons(pokemons);

        const filter: Filter = { or: allOtherPokemons.sortAsc('id').map((pokemon) => '' + pokemon.id) };
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

type Filter = { and: Filter[] } | { or: Filter[] } | { not: Filter } | FilterElement;

enum FilterKey {
    éclos,
    raid,
    étude,
}
