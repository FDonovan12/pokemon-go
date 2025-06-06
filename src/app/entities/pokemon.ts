import { pokemonsListHomeMade } from 'app/bdd/bdd-home-made';
import { pokemonSlugs } from 'app/bdd/name-pokemon';

type ExtractSlug<T extends readonly { slug: string }[]> = T[number]['slug'];

export type HomemadePokemonSlug = ExtractSlug<typeof pokemonsListHomeMade>;

type test = (typeof pokemonSlugs)[number];

export type PokemonSlug = test | HomemadePokemonSlug;

export interface PokemonInterface {
    id: number;
    name: string;
    image: string;
    sprite: string;
    slug: PokemonSlug;
    type: typePokemon[];
}

export class Pokemon implements PokemonInterface {
    id: number;
    name: string;
    slug: PokemonSlug;
    type: typePokemon[];
    constructor(rawData: PokemonInterface) {
        this.id = rawData.id;
        this.name = rawData.name;
        this.slug = rawData.slug;
        this.type = rawData.type;
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
