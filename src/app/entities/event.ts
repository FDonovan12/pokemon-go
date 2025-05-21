import { PokemonInterface } from '../repositories/pokemon/get-all.service';

export interface EventInterface {
    name: string;
    slug: string;
    startAt: Date;
    endAt: Date;
    savagePokemons: (PokemonInterface & { mega?: PokemonInterface })[];
    eggPokemons: PokemonInterface[];
}
