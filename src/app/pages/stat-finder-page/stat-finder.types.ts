import { PokemonSlug } from '@entities/pokemon';

export type IvComparison = 'exact' | 'min';
export type IvMode = 'common' | 'separate';

export interface IvCriteria {
    mode: IvMode;
    comparison: IvComparison;
    common: number | null; // utilisé si mode === 'common'
    atk: number | null; // utilisé si mode === 'separate'
    def: number | null;
    sta: number | null;
}

export interface CardPrerequisites {
    level: number | null;
    cp: number | null;
    iv: IvCriteria;
}

export interface CardEntry {
    id: string;
    pokemonSlugs: PokemonSlug[];
    prerequisites: CardPrerequisites;
}

export interface StatMatch {
    level: number;
    atk: number;
    def: number;
    sta: number;
    cp: number;
}

export function createEmptyCard(): CardEntry {
    return {
        id: crypto.randomUUID(),
        pokemonSlugs: [],
        prerequisites: {
            level: null,
            cp: null,
            iv: { mode: 'common', comparison: 'exact', common: null, atk: null, def: null, sta: null },
        },
    };
}
