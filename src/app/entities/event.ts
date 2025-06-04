import { PokemonInterface } from '../repositories/pokemon/get-all.service';

export interface EventInterface {
    name: string;
    slug: string;
    startAt: Date;
    endAt: Date;
    savagePokemons: SavagePokemons[];
    eggPokemons: PokemonInterface[];
    raidPokemons?: PokemonInterface[];
}

export interface SavagePokemons {
    title?: string;
    pokemons: PokemonInterface[];
    megas?: PokemonInterface[];
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
