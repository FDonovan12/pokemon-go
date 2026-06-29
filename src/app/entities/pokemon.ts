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
    name: string;
    generation: number;
    slug: PokemonSlug;
    imageId: number;
    image: string;
    type: Type[];
    stats: Stats;
    quickMoves: string[];
    cinematicMoves: string[];
    eliteQuickMove: string[];
    eliteCinematicMove: string[];
    nonTmCinematicMoves: string[];
    evolutionIds: string[];
    family: string;
    isLegendary: boolean;
    isMythical: boolean;
    isUltraBeast: boolean;
    form: string;
    encounter: Encounter;
}

export interface Encounter {
    stardustCaptureReward: number;
}

export interface Stats {
    baseStamina: number;
    baseAttack: number;
    baseDefense: number;
}

export enum Type {
    PokemonTypeBug = 'POKEMON_TYPE_BUG',
    PokemonTypeDark = 'POKEMON_TYPE_DARK',
    PokemonTypeDragon = 'POKEMON_TYPE_DRAGON',
    PokemonTypeElectric = 'POKEMON_TYPE_ELECTRIC',
    PokemonTypeFairy = 'POKEMON_TYPE_FAIRY',
    PokemonTypeFighting = 'POKEMON_TYPE_FIGHTING',
    PokemonTypeFire = 'POKEMON_TYPE_FIRE',
    PokemonTypeFlying = 'POKEMON_TYPE_FLYING',
    PokemonTypeGhost = 'POKEMON_TYPE_GHOST',
    PokemonTypeGrass = 'POKEMON_TYPE_GRASS',
    PokemonTypeGround = 'POKEMON_TYPE_GROUND',
    PokemonTypeIce = 'POKEMON_TYPE_ICE',
    PokemonTypeNormal = 'POKEMON_TYPE_NORMAL',
    PokemonTypePoison = 'POKEMON_TYPE_POISON',
    PokemonTypePsychic = 'POKEMON_TYPE_PSYCHIC',
    PokemonTypeRock = 'POKEMON_TYPE_ROCK',
    PokemonTypeSteel = 'POKEMON_TYPE_STEEL',
    PokemonTypeWater = 'POKEMON_TYPE_WATER',
}

export interface RankPVP {
    great: LeagueStats;
    ultra: LeagueStats;
}

export interface LeagueStats {
    atk: number;
    def: number;
    sta: number;
    level: number;
}

export interface Different {
    base: Base;
    same: Base[];
}

export interface PokemonInterface {
    id: number;
    name: NamePokemon;
    slug: PokemonSlug;
    image: string;
    sprite: string;
    type: TypePokemon[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] };
    alternatives?: AlternativePokemon;
    generation: GenerationPokemon;
    family: PokemonFamily;
}

export type AlternativePokemon = Record<
    'Gmax' | 'Galar' | 'Alola' | 'Hisui' | 'Rapid-strike' | 'Single-strike-gmax' | 'Rapid-strike-gmax' | 'Crowned',
    PokemonInterface
>;

// export class Pokemon implements PokemonInterface {
//     id: number;
//     name: string;
//     slug: PokemonSlug;
//     type: TypePokemon[];
//     isLegendary: boolean;
//     isMythical: boolean;
//     mega?: { id: number; type: string[] } | undefined;
//     alternatives?: AlternativePokemon;

//     constructor(rawData: PokemonInterface) {
//         this.id = rawData.id;
//         this.name = rawData.name;
//         this.slug = rawData.slug;
//         this.type = rawData.type;
//         this.isLegendary = rawData.isLegendary;
//         this.isMythical = rawData.isMythical;
//         this.mega = rawData.mega;
//         this.alternatives = rawData.alternatives;
//     }
//     get image(): string {
//         return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.id}.png`;
//     }
//     get sprite(): string {
//         return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${this.id}.png`;
//     }
// }

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

export class Dynamax {
    pokemon: PokemonInterface;
    attack: number;
    attackType: TypePokemon[];
    isRelease: boolean;

    constructor(pokemon: PokemonInterface, attack: number, attackType: TypePokemon[], isRelease: boolean = true) {
        this.pokemon = pokemon;
        this.attack = attack;
        this.attackType = attackType;
        this.isRelease = isRelease;
    }

    get damageAttack() {
        return 350;
    }

    damageAgainst(opponent: TypePokemon) {}
}

export class Gigamax extends Dynamax {
    constructor(pokemon: PokemonInterface, attack: number, attackType: TypePokemon[], isRelease: boolean = true) {
        if (pokemon.alternatives?.Gmax) {
            pokemon = pokemon.alternatives.Gmax;
        }
        super(pokemon, attack, attackType, isRelease);
    }
    override get damageAttack() {
        return 450;
    }
}
