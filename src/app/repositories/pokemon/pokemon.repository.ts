import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons.json';
import { megaPokemon } from 'app/bdd/mega-pokemon';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';

const pokemonsList = pokemonsData as PokemonInterface[];

type PokemonHomeMade = (typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['id'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};
@Injectable({
    providedIn: 'root',
})
export class PokemonRepository {
    private buildPokemonIndex = (
        listFromAPI: readonly PokemonInterface[],
        listHomemade: readonly PokemonHomeMade[] = [],
    ): PokemonIndex => {
        const list = [...listFromAPI, ...listHomemade] as PokemonInterface[];
        return {
            byId: Object.fromEntries(list.map((p) => [p.id, p])) as Record<PokemonInterface['id'], PokemonInterface>,
            byName: Object.fromEntries(list.map((p) => [p.slug, p])) as Record<
                PokemonInterface['slug'],
                PokemonInterface
            >,
        };
    };
    pokemonIndex = this.buildPokemonIndex(pokemonsList, pokemonsListHomeMade);

    starterPokemon = [
        this.pokemonIndex.byName.Bulbizarre,
        this.pokemonIndex.byName.Salameche,
        this.pokemonIndex.byName.Carapuce,
        this.pokemonIndex.byName.Germignon,
        this.pokemonIndex.byName.Hericendre,
        this.pokemonIndex.byName.Kaiminus,
        this.pokemonIndex.byName.Arcko,
        this.pokemonIndex.byName.Poussifeu,
        this.pokemonIndex.byName.Tortipouss,
        this.pokemonIndex.byName.Ouisticram,
        this.pokemonIndex.byName.Tiplouf,
        this.pokemonIndex.byName.Gobou,
        this.pokemonIndex.byName.Vipelierre,
        this.pokemonIndex.byName.Gruikui,
        this.pokemonIndex.byName.Moustillon,
        this.pokemonIndex.byName.Marisson,
        this.pokemonIndex.byName.Feunnec,
        this.pokemonIndex.byName.Grenousse,
        this.pokemonIndex.byName.Brindibou,
        this.pokemonIndex.byName.Flamiaou,
        this.pokemonIndex.byName.Otaquin,
        this.pokemonIndex.byName.Ouistempo,
        this.pokemonIndex.byName.Flambino,
        this.pokemonIndex.byName.Larmeleon,
        this.pokemonIndex.byName.Chochodile,
        this.pokemonIndex.byName.Poussacha,
        this.pokemonIndex.byName.Coiffeton,
    ];

    megaList = this.buildMegaList();

    private buildMegaList(): PokemonInterface[] {
        const listBase = megaPokemon;
        return listBase as PokemonInterface[];
    }
}
