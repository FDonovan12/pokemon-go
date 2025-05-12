import { PokemonInterface } from '../repositories/pokemon/get-all.service';

export interface EventInterface {
    name: string;
    slug: string;
    savagePokemons: (PokemonInterface & { mega?: PokemonInterface })[];
    eggPokemons: PokemonInterface[];
}
