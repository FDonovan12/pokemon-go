import { Brand } from './pokemon';

export type IV = Brand<number, 'IV'>; // 0-15
export type FilterTier = Brand<number, 'FilterTier'>; // 0-4

export function ivToFilterValue(iv: IV): FilterTier {
    if (iv === 0) return 0 as FilterTier;
    if (iv <= 5) return 1 as FilterTier;
    if (iv <= 10) return 2 as FilterTier;
    if (iv <= 14) return 3 as FilterTier;
    return 4 as FilterTier;
}

export type RangeCombo<T extends number = number> = {
    min: T;
    max: T;
};

export type IVRange = RangeCombo<IV>;
export type FilterRange = RangeCombo<FilterTier>;

export type Combo<T extends number = number> = {
    attack: T;
    defense: T;
    stamina: T;
};

export type GroupedCombo<T extends number = number> = {
    attack: RangeCombo<T>;
    defense: RangeCombo<T>;
    stamina: RangeCombo<T>;
};

export type StatKey = 'attack' | 'defense' | 'stamina';

export type RangeWithStat<T extends number = number> = {
    stat: StatKey;
    range: RangeCombo<T>;
};
export type AllRankPVP<T extends number = number> = {
    super: LeagueStats<T>[];
    hyper: LeagueStats<T>[];
};
export interface RankPVP<T extends number = number> {
    super: LeagueStats<T>[];
    hyper: LeagueStats<T>[];
}

export interface LeagueStats<T extends number = number> {
    attack: T;
    defense: T;
    stamina: T;
    level: number;
    stat: number;
    rank: number;
}

export type FilterDef<T extends number = number> = {
    key: string;
    combo: GroupedCombo<T>;
};

export type DeepConvert<T> = T extends IV
    ? FilterTier
    : T extends readonly (infer U)[]
      ? DeepConvert<U>[]
      : T extends object
        ? { [K in keyof T]: DeepConvert<T[K]> }
        : T;
