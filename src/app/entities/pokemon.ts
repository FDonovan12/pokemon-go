import { pokemonFamilyName } from '../bdd/family-pokemon-name';
import { pokemonSlugs } from '../bdd/name-pokemon';

type ExtractSlug<T extends readonly { slug: string }[]> = T[number]['slug'];

// export type HomemadePokemonSlug = ExtractSlug<typeof pokemonsListHomeMade>;

export const generationsPokemon = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type PokemonSlug = (typeof pokemonSlugs)[number];
export type GenerationPokemon = (typeof generationsPokemon)[number];
export type PokemonFamily = (typeof pokemonFamilyName)[number];

export type Brand<T, B extends string> = T & { readonly __brand: B };
export type NamePokemon = Brand<string, 'NamePokemon'>;

export interface PokemonSetting {
    base: Base;
    same: Base[];
    different: Different[];
}

export interface Base {
    id: string;
    pokemonId: string;
    dexNumber: number;
    name: NamePokemon;
    generation: GenerationPokemon;
    slug: PokemonSlug;
    imageId: number;
    image: string;
    imageShiny: string;
    type: TypePokemon[];
    stats: Stats;
    quickMoves: string[];
    cinematicMoves: string[];
    eliteQuickMove: string[];
    eliteCinematicMove: string[];
    nonTmCinematicMoves: string[];
    evolutionIds: Evolution[];
    family: PokemonFamily;
    isLegendary: boolean;
    isMythical: boolean;
    isUltraBeast: boolean;
    form: string;
    encounter: Encounter;
}

export interface Evolution {
    pokemonId?: string;
    form: string;
}

export interface Encounter {
    stardustCaptureReward: number;
}

export interface Stats {
    baseStamina: number;
    baseAttack: number;
    baseDefense: number;
}

export interface Different {
    base: Base;
    same: Base[];
}

export interface PokemonInterface {
    dexNumber: number;
    name: NamePokemon;
    slug: PokemonSlug;
    image: string;
    imageShiny: string;
    type: TypePokemon[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] };
    alternatives?: AlternativePokemon;
    generation: GenerationPokemon;
    family: PokemonFamily;
}
export type DynamaxApiEntry = {
    pokemonId: string;
    name: NamePokemon;
    slug: PokemonSlug;
    dexNumber: number;
    image: string;
    imageShiny: string;
    type: TypePokemon[];
    stats: { baseAttack: number; baseDefense: number; baseStamina: number };
    dynamaxMove: DynamaxMove[];
    isReleased?: boolean;
    family: PokemonFamily;
};
export type PokemonData = PokemonInterface | Base;

export type AlternativePokemon = Record<
    'Gmax' | 'Galar' | 'Alola' | 'Hisui' | 'Rapid-strike' | 'Single-strike-gmax' | 'Rapid-strike-gmax' | 'Crowned',
    PokemonInterface
>;

export const allTypes = [
    'Acier',
    'Combat',
    'Dragon',
    'Eau',
    'Électrik',
    'Fée',
    'Feu',
    'Glace',
    'Insecte',
    'Normal',
    'Plante',
    'Poison',
    'Psy',
    'Roche',
    'Sol',
    'Spectre',
    'Ténèbres',
    'Vol',
] as const;

export type TypePokemon = (typeof allTypes)[number];

export type DynamaxMove = {
    pokemonType: TypePokemon;
    powerLevels?: number[];
};

export class Dynamax {
    pokemon: DynamaxApiEntry;
    stats: { baseAttack: number; baseDefense: number; baseStamina: number };
    dynamaxMoves: DynamaxMove[];
    isRelease: boolean;

    constructor(pokemon: DynamaxApiEntry, isRelease: boolean = true) {
        this.pokemon = pokemon;
        this.stats = pokemon.stats;
        this.dynamaxMoves = pokemon.dynamaxMove;
        this.isRelease = isRelease;
    }

    get attack() {
        return this.pokemon.stats.baseAttack;
    }

    get attackType(): TypePokemon[] {
        return this.dynamaxMoves.map((move) => move.pokemonType);
    }

    get damageAttack(): number {
        return this.dynamaxMoves[0]?.powerLevels?.[2] ?? 350;
    }

    damageAgainst(opponent: TypePokemon) {}
}
