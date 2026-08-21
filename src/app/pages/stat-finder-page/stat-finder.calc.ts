import { Injectable, inject } from '@angular/core';
import { Combo, IV } from '@entities/stats';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { PokemonCalcService } from '@services/pokemon-calc-service/pokemon-calc.services';
import { CardPrerequisites, IvComparison, IvCriteria, StatMatch } from './stat-finder.types';

export interface Stats {
    baseAttack: number;
    baseDefense: number;
    baseStamina: number;
}

interface Ivs {
    atk: number;
    def: number;
    sta: number;
}

// identique à la logique de src/generators/rankPVP.ts côté parser
export function calcCP(base: Stats, iv: Ivs, cpm: number): number {
    return Math.floor(
        ((base.baseAttack + iv.atk) *
            Math.sqrt(base.baseDefense + iv.def) *
            Math.sqrt(base.baseStamina + iv.sta) *
            cpm ** 2) /
            10,
    );
}

function range(min: number, max: number): number[] {
    const result: number[] = [];
    for (let i = min; i <= max; i++) result.push(i);
    return result;
}

function allLevels(cpms: Record<string, number>): number[] {
    return Object.keys(cpms)
        .map(Number)
        .filter((level) => level <= 55)
        .sortAsc();
}

function buildIvRange(value: number | null, comparison: IvComparison): number[] {
    if (value === null) return range(0, 15);
    return comparison === 'exact' ? [value] : range(value, 15);
}

function resolveIvRanges(iv: IvCriteria): { atk: number[]; def: number[]; sta: number[] } {
    if (iv.mode === 'common') {
        const r = buildIvRange(iv.common, iv.comparison);
        return { atk: r, def: r, sta: r };
    }
    return {
        atk: buildIvRange(iv.atk, iv.comparison),
        def: buildIvRange(iv.def, iv.comparison),
        sta: buildIvRange(iv.sta, iv.comparison),
    };
}

export function hasNoPrerequisites(prerequisites: CardPrerequisites): boolean {
    if (prerequisites.cp !== null) return false;
    if (prerequisites.level !== null) return false;

    const { iv } = prerequisites;
    if (iv.mode === 'common') return iv.common === null;
    return iv.atk === null && iv.def === null && iv.sta === null;
}
@Injectable({
    providedIn: 'root',
})
export class StatFinderCalcService {
    private _pokemonCalcService = inject(PokemonCalcService);
    private _pokemonRepository = inject(PokemonRepository);

    findStatMatches(base: Stats, prerequisites: CardPrerequisites): StatMatch[] {
        const levels = !!prerequisites.level === false ? this._pokemonRepository.allLevels() : [prerequisites.level];
        const { atk: atkRange, def: defRange, sta: staRange } = resolveIvRanges(prerequisites.iv);

        const results: StatMatch[] = [];
        for (const level of levels) {
            const cpm = this._pokemonRepository.cpMultiplier.get(level.toString());
            if (!cpm) continue;

            for (const atk of atkRange) {
                for (const def of defRange) {
                    for (const sta of staRange) {
                        const iv: Combo<IV> = { attack: atk, defense: def, stamina: sta } as Combo<IV>;
                        const cp = this._pokemonCalcService.calcCp(base, iv, cpm);
                        if (prerequisites.cp !== null && cp !== prerequisites.cp) continue;
                        results.push({ level, atk, def, sta, cp });
                    }
                }
            }
        }
        return results;
    }
}
