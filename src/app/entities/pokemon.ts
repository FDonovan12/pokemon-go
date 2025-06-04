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
    type: string[];
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
