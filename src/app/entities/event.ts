import { PokemonInterface } from '../repositories/get-all.service';

export interface EventInterface {
    name: string;
    slug: string;
    savagePokemons: PokemonInterface[];
    eggPokemons: PokemonInterface[];
}
