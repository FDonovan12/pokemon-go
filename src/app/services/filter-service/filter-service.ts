import { inject, Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import {
    Combo,
    DeepConvert,
    FilterDef,
    FilterTier,
    GroupedCombo,
    IV,
    RangeCombo,
    RangeWithStat,
    StatKey,
} from '@entities/stats';
import { ListPokemonRepository } from '@repositories/list-pokemon-repository/list-pokemon.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { ToastService } from '@shared/features/toast/toast.service';
import { ListCondition } from './../../repositories/filters-repository/filter.model';
const MAX_GROUPS = 6; // 3^6 = 729 clauses max
const OR_JOIN = ',';
const AND_JOIN = '&';
const NOT_JOIN = '!';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private readonly _toastService: ToastService = inject(ToastService);
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);
    private readonly _listPokemonRepository: ListPokemonRepository = inject(ListPokemonRepository);

    readonly BASIC_FILTER: FilterDef<IV>[] = [
        {
            key: 'zero-atk',
            combo: {
                attack: { min: 0, max: 0 },
                defense: { min: 0, max: 15 },
                stamina: { min: 0, max: 15 },
            },
        },
        {
            key: 'low-atk-high-other',
            combo: {
                attack: { min: 0, max: 5 },
                defense: { min: 11, max: 15 },
                stamina: { min: 11, max: 15 },
            },
        },
        {
            key: 'low-atk-mid-other',
            combo: {
                attack: { min: 0, max: 5 },
                defense: { min: 6, max: 10 },
                stamina: { min: 6, max: 10 },
            },
        },
        {
            key: 'mid-atk-high-other',
            combo: {
                attack: { min: 6, max: 10 },
                defense: { min: 11, max: 15 },
                stamina: { min: 11, max: 15 },
            },
        },
        {
            key: 'mid-atk-mid-other',
            combo: {
                attack: { min: 6, max: 10 },
                defense: { min: 6, max: 10 },
                stamina: { min: 6, max: 10 },
            },
        },
        {
            key: 'high-atk-high-other',
            combo: {
                attack: { min: 11, max: 15 },
                defense: { min: 11, max: 15 },
                stamina: { min: 11, max: 15 },
            },
        },
    ] as FilterDef<IV>[];

    isInTheFilterTier(filterTier: FilterDef<FilterTier>, pokemonStat: Combo<IV>): boolean {
        const pokemonTier = this.convertIvToFilterTier(pokemonStat);
        const isAttackInRange =
            pokemonTier.attack <= filterTier.combo.attack.max && pokemonTier.attack >= filterTier.combo.attack.min;
        const isDefenseInRange =
            pokemonTier.defense <= filterTier.combo.defense.max && pokemonTier.defense >= filterTier.combo.defense.min;
        const isStaminaInRange =
            pokemonTier.stamina <= filterTier.combo.stamina.max && pokemonTier.stamina >= filterTier.combo.stamina.min;
        return isAttackInRange && isDefenseInRange && isStaminaInRange;
    }

    ivToFilterTier(iv: IV): FilterTier {
        let result = 4;
        if (iv <= 14) result = 3;
        if (iv <= 10) result = 2;
        if (iv <= 5) result = 1;
        if (iv === 0) result = 0;
        return result as FilterTier;
    }
    convertIvToFilterTier<T>(value: T): DeepConvert<T> {
        if (typeof value === 'number') {
            return this.ivToFilterTier(value as any as IV) as DeepConvert<T>;
        }
        if (Array.isArray(value)) {
            return value.map((v) => this.convertIvToFilterTier(v)) as DeepConvert<T>;
        }
        if (typeof value === 'object' && value !== null) {
            const result = {} as Record<string, unknown>;
            for (const key in value) {
                result[key] = this.convertIvToFilterTier((value as Record<string, unknown>)[key]);
            }
            return result as DeepConvert<T>;
        }
        return value as DeepConvert<T>;
    }

    groupComboToRangeWithStat<T extends number>(combo: GroupedCombo<T>): RangeWithStat<T>[] {
        return [
            { stat: 'attack', range: combo.attack },
            { stat: 'defense', range: combo.defense },
            { stat: 'stamina', range: combo.stamina },
        ];
    }

    private equalsRange<T extends number>(a: RangeCombo<T>, b: RangeCombo<T>): boolean {
        return a.min === b.min && a.max === b.max;
    }

    private canMerge<T extends number>(a: GroupedCombo<T>, b: GroupedCombo<T>): boolean {
        let diff = 0;
        const dims: (keyof GroupedCombo<T>)[] = ['attack', 'defense', 'stamina'];
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
        attack: 'attaque',
        defense: 'défense',
        stamina: 'pv',
    };

    private comboToGrouped<T extends number>(combo: Combo<T>): GroupedCombo<T> {
        return {
            attack: { min: combo.attack, max: combo.attack },
            defense: { min: combo.defense, max: combo.defense },
            stamina: { min: combo.stamina, max: combo.stamina },
        };
    }
    comboToFilter = (input: Combo<FilterTier> | GroupedCombo<FilterTier>): string => {
        const group = this.isGroupedCombo(input) ? input : this.comboToGrouped(input);
        return this.groupedComboToFilter(group);
    };
    private isGroupedCombo<T extends number>(input: Combo<T> | GroupedCombo<T>): input is GroupedCombo<T> {
        return typeof input.attack === 'object';
    }

    private excludedForStat(range: RangeCombo<FilterTier>, stat: StatKey): string {
        const suffix = this.statSuffix[stat];
        const allStats = [0, 1, 2, 3, 4];
        return allStats
            .filter((tier) => tier < range.min || tier > range.max)
            .map((tier) => `${tier}${suffix}`)
            .join(',');
    }

    comboToFilterExcluded = (combo: Combo<FilterTier> | GroupedCombo<FilterTier>): string => {
        const group = this.isGroupedCombo(combo) ? combo : this.comboToGrouped(combo);
        const allAtq = this.excludedForStat(group.attack, 'attack');
        const allDef = this.excludedForStat(group.defense, 'defense');
        const allStamina = this.excludedForStat(group.stamina, 'stamina');
        return `${allAtq}, ${allDef}, ${allStamina}`;
    };

    groupedComboToFilter = (group: GroupedCombo<FilterTier>): string => {
        const rangestats = this.groupComboToRangeWithStat(group);
        const strings = rangestats.map(this.formatRange);
        return strings.join('& ');
    };
    reverseGroupedComboToFilter = <T extends number>(group: GroupedCombo<T>): string => {
        const rangestats = this.groupComboToRangeWithStat(group);
        const strings = rangestats.map(this.formatRange);
        return strings.join(', ');
    };
    groupedComboToLabel = <T extends number>(group: GroupedCombo<T>): string => {
        const rangestats = this.groupComboToRangeWithStat(group);
        const strings = rangestats.map(this.formatRange);
        return strings.join('\n');
    };

    private formatRange = <T extends number>(r: RangeWithStat<T>): string => {
        const suffix = this.statSuffix[r.stat];
        return r.range.min === r.range.max ? `${r.range.min}${suffix}` : `${r.range.min}-${r.range.max}${suffix}`; //`${r.range.min}\u2011${r.range.max}${suffix}`;
    };

    private merge<T extends number>(a: GroupedCombo<T>, b: GroupedCombo<T>): GroupedCombo<T> {
        const dims: (keyof GroupedCombo<T>)[] = ['attack', 'defense', 'stamina'];
        const result = {} as GroupedCombo<T>;
        for (const dim of dims) {
            result[dim] = {
                min: Math.min(a[dim].min, b[dim].min) as T,
                max: Math.max(a[dim].max, b[dim].max) as T,
            };
        }
        return result;
    }

    buildComboFilter(combos: Combo<FilterTier>[]): string {
        let groups: GroupedCombo<FilterTier>[] = combos.map((c) => this.comboToGrouped(c));

        let changed = true;

        while (changed) {
            changed = false;
            const next: GroupedCombo<FilterTier>[] = [];
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
        if (groups.length > MAX_GROUPS) {
            console.log(groups.length);
            this._toastService
                .prepare('❌ Erreur', `Filtre trop complexe — modifier la "limite filtre pokemon"`)
                .showError();
            return '';
        }
        return this.buildComboFilterClause(groups);
    }

    private buildComboFilterClause(combos: GroupedCombo<FilterTier>[]): string {
        if (combos.length === 0) {
            return '';
        }

        // Chaque combo devient un tableau de termes
        const groups = combos.map(this.groupComboToRangeWithStat);

        // Produit cartésien des groupes
        let result: RangeWithStat<FilterTier>[][] = [[]];

        for (const group of groups) {
            const next: RangeWithStat<FilterTier>[][] = [];

            for (const partial of result) {
                for (const term of group) {
                    next.push([...partial, term]);
                }
            }

            result = next;
        }

        // Chaque combinaison devient un OR
        const filter = result.map((clause) => this.filterRedundantRanges(clause));
        const final = filter.map((clause) => clause.map(this.formatRange).join(', ')).join(' & ');
        return final;
    }

    private filterRedundantRanges(ranges: RangeWithStat<FilterTier>[]): RangeWithStat<FilterTier>[] {
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
        const cleaned = lists;

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
