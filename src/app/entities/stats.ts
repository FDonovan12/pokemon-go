import { Brand } from './pokemon';

export type IV = Brand<number, 'IV'>; // 0-15
export type FilterTier = Brand<number, 'FilterTier'>; // 0-4

export type RangeCombo<T extends number = number> = {
    min: T;
    max: T;
};

export type IVRange = RangeCombo<IV>;
export type FilterRange = RangeCombo<FilterTier>;

export type Combo<T extends number = number> = {
    atq: T;
    def: T;
    stamina: T;
};

export type GroupedCombo<T extends number = number> = {
    atq: RangeCombo<T>;
    def: RangeCombo<T>;
    stamina: RangeCombo<T>;
};

export type StatKey = 'atq' | 'def' | 'stamina';

export type RangeWithStat<T extends number = number> = {
    stat: StatKey;
    range: RangeCombo<T>;
};
export type AllRankPVP<T extends number = number> = {
    super: LeagueStats<T>[];
    hyper: LeagueStats<T>[];
};
export interface RankPVP<T extends number = number> {
    super: LeagueStats<T>;
    hyper: LeagueStats<T>;
}

export interface LeagueStats<T extends number = number> {
    atk: T;
    def: T;
    sta: T;
    level: number;
    stat: number;
}
