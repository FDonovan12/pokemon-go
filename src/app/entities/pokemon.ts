import { pokemonSlugs } from 'app/bdd/name-pokemon';

type ExtractSlug<T extends readonly { slug: string }[]> = T[number]['slug'];

// export type HomemadePokemonSlug = ExtractSlug<typeof pokemonsListHomeMade>;

type test = (typeof pokemonSlugs)[number];

export type PokemonSlug = test;

// export interface PokemonInterface {
//     id: number;
//     name: string;
//     image: string;
//     sprite: string;
//     slug: PokemonSlug;
//     type: typePokemon[];
// }
export interface PokemonInterface {
    id: number;
    name: string;
    slug: PokemonSlug;
    image: string;
    sprite: string;
    type: typePokemon[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] };
    alternatives?: AlternativePokemon;
}

export type AlternativePokemon = Record<'Gmax' | 'Galar' | 'Alola' | 'Hisui', PokemonInterface>;
export class Pokemon implements PokemonInterface {
    id: number;
    name: string;
    slug: PokemonSlug;
    type: typePokemon[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] } | undefined;
    alternatives?: AlternativePokemon;

    constructor(rawData: PokemonInterface) {
        this.id = rawData.id;
        this.name = rawData.name;
        this.slug = rawData.slug;
        this.type = rawData.type;
        this.isLegendary = rawData.isLegendary;
        this.isMythical = rawData.isMythical;
        this.mega = rawData.mega;
        this.alternatives = rawData.alternatives;
    }
    get image(): string {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.id}.png`;
    }
    get sprite(): string {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${this.id}.png`;
    }
}

export type typePokemon =
    | 'Acier'
    | 'Combat'
    | 'Dragon'
    | 'Eau'
    | 'Électrik'
    | 'Fée'
    | 'Feu'
    | 'Glace'
    | 'Insecte'
    | 'Normal'
    | 'Plante'
    | 'Poison'
    | 'Psy'
    | 'Roche'
    | 'Sol'
    | 'Spectre'
    | 'Ténèbres'
    | 'Vol';
