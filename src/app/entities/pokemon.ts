import { CinematicMovePokemon, FastMovePokemon } from '@repositories/move/move.repository';
import { pokemonFamilyName } from '../bdd/family-pokemon-name';
import { pokemonSlugs } from '../bdd/name-pokemon';

type ExtractSlug<T extends readonly { slug: string }[]> = T[number]['slug'];

// export type HomemadePokemonSlug = ExtractSlug<typeof pokemonsListHomeMade>;

export const generationsPokemon = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type OldPokemonSlug = (typeof pokemonSlugs)[number];
export type GenerationPokemon = (typeof generationsPokemon)[number];
export type PokemonFamily = (typeof pokemonFamilyName)[number];

export type Brand<T, B extends string> = T & { readonly __brand: B };
export type NamePokemon = Brand<string, 'NamePokemon'>;
export type PokemonSlug = Brand<string, 'PokemonSlug'>;
export type PokemonId = Brand<string, 'PokemonId'>;

export interface PokemonSetting {
    base: Base;
    same: Base[];
    different: Different[];
}

export interface Base {
    id: string;
    pokemonId: PokemonId;
    dexNumber: number;
    name: NamePokemon;
    generation: GenerationPokemon;
    slug: PokemonSlug;
    imageId: number;
    image: string;
    imageShiny: string;
    types: TypePokemon[];
    stats: Stats;
    quickMoves: FastMovePokemon[];
    cinematicMoves: CinematicMovePokemon[];
    eliteQuickMove: FastMovePokemon[];
    eliteCinematicMove: CinematicMovePokemon[];
    nonTmCinematicMoves: CinematicMovePokemon[];
    hasMega: boolean;
    evolutionIds: Evolution[];
    family: PokemonFamily;
    isLegendary: boolean;
    isMythical: boolean;
    isUltraBeast: boolean;
    form: string;
    encounter: Encounter;
    mega?: Mega[];
    parentPokemonId?: PokemonId;
}

export interface Mega {
    name: NamePokemon;
    slug: PokemonSlug;
    stats?: Stats;
    image: string;
    types: TypePokemon[];
    hasLevel4: boolean;
    megaAttack?: MegaAttack;
}

export interface MegaAttack {
    id: string;
    movementId: CinematicMovePokemon;
    pokemonType: TypePokemon;
    power: number;
    durationMs: number;
    energyDelta: number;
    vfxName: string;
}

export function oldSlugToNew(slug: OldPokemonSlug | PokemonSlug): PokemonSlug {
    return slug.slugify() as PokemonSlug;
}

export interface Evolution {
    pokemonId?: PokemonId;
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
    slug: OldPokemonSlug;
    image: string;
    imageShiny: string;
    types: TypePokemon[];
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
    types: TypePokemon[];
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
    isManual: boolean;

    constructor(pokemon: DynamaxApiEntry, isManual: boolean = false) {
        this.pokemon = pokemon;
        this.stats = pokemon.stats;
        this.dynamaxMoves = pokemon.dynamaxMove;
        this.isRelease = pokemon.isReleased ?? true;
        this.isManual = isManual;
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

    static fromBase(base: Base, quickMoveTypes: TypePokemon[]): Dynamax {
        const entry: DynamaxApiEntry = {
            pokemonId: base.pokemonId,
            name: base.name,
            slug: base.slug,
            dexNumber: base.dexNumber,
            image: base.image,
            imageShiny: base.imageShiny,
            types: base.types,
            family: base.family,
            stats: base.stats,
            dynamaxMove: quickMoveTypes.unique().map((pokemonType) => ({
                pokemonType,
                powerLevels: [250, 300, 350, 450], // puissance fixe : jamais Gigamax pour un ajout manuel
            })),
            isReleased: false,
        };
        return new Dynamax(entry, true);
    }
}
