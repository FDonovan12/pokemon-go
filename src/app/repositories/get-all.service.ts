import { Injectable } from '@angular/core';
import { pokemonsList } from '../bdd/bdd-pokemons';

export interface PokemonInterface {
    id: number;
    name: string;
    image: string;
    sprite: string;
    slug: string;
}

type Pokemon = (typeof pokemonsList)[number];
type PokemonIndex = {
    byId: Record<Pokemon['id'], Pokemon>;
    byName: Record<Pokemon['slug'], Pokemon>;
};
@Injectable({
    providedIn: 'root',
})
export class GetAllService {
    private buildPokemonIndex = (list: readonly Pokemon[]): PokemonIndex => ({
        byId: Object.fromEntries(list.map((p) => [p.id, p])) as Record<Pokemon['id'], Pokemon>,
        byName: Object.fromEntries(list.map((p) => [p.name.toLowerCase(), p])) as Record<Pokemon['slug'], Pokemon>,
    });

    pokemonIndex = this.buildPokemonIndex(pokemonsList);
}
