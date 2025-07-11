import { pokemonFamilyName } from 'app/bdd/family-pokemon-name';
import { pokemonSlugs } from 'app/bdd/name-pokemon';

type ExtractSlug<T extends readonly { slug: string }[]> = T[number]['slug'];

// export type HomemadePokemonSlug = ExtractSlug<typeof pokemonsListHomeMade>;

export type PokemonSlug = (typeof pokemonSlugs)[number];
export type PokemonFamily = (typeof pokemonFamilyName)[number];

export interface PokemonInterface {
    id: number;
    name: string;
    slug: PokemonSlug;
    image: string;
    sprite: string;
    type: TypePokemon[];
    isLegendary: boolean;
    isMythical: boolean;
    mega?: { id: number; type: string[] };
    alternatives?: AlternativePokemon;
    generation: number;
    family: PokemonFamily;
}

export type AlternativePokemon = Record<'Gmax' | 'Galar' | 'Alola' | 'Hisui', PokemonInterface>;
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
];

export type TypePokemon = (typeof allTypes)[number];
