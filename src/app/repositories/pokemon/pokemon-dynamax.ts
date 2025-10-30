import { inject, Injectable } from '@angular/core';
import { Dynamax, Gigamax } from '@entities/pokemon';
import { PokemonRepository } from './pokemon.repository';

@Injectable({
    providedIn: 'root',
})
export class PokemonDynamaxRepository {
    private readonly pokemonRepository: PokemonRepository = inject(PokemonRepository);
    getDynamaxPokemon() {
        const pokemons = this.pokemonRepository.pokemonIndex.byName;
        const result: Dynamax[] = [
            new Dynamax(pokemons.Florizarre, 198, ['Plante']),
            new Dynamax(pokemons.Dracaufeu, 223, ['Feu', 'Dragon', 'Vol']),
            new Gigamax(pokemons.Florizarre, 198, ['Plante']),
            new Gigamax(pokemons.Dracaufeu, 223, ['Feu']),
        ];

        return result;
    }
}
