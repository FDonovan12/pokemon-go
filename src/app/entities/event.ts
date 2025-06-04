import { PokemonInterface } from './pokemon';

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
