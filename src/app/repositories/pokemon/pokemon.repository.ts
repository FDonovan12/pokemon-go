import { Injectable } from '@angular/core';
import { Pokemon, PokemonInterface } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons.json';
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
        const listBase: PokemonInterface[] = [
            new Pokemon({ ...this.pokemonIndex.byName.Florizarre, id: 10033 }),
            new Pokemon({ ...this.pokemonIndex.byName.Tortank, id: 10036 }),
            new Pokemon({ ...this.pokemonIndex.byName.Dardargnan }),
            new Pokemon({ ...this.pokemonIndex.byName.Roucarnage }),
            new Pokemon({ ...this.pokemonIndex.byName.Ectoplasma }),
            new Pokemon({ ...this.pokemonIndex.byName.Demolosse }),
            new Pokemon({ ...this.pokemonIndex.byName.Blizzaroi }),
            new Pokemon({ ...this.pokemonIndex.byName.Pharamp }),
            new Pokemon({ ...this.pokemonIndex.byName.Elecsprint }),
            new Pokemon({ ...this.pokemonIndex.byName.Lockpin }),
            new Pokemon({ ...this.pokemonIndex.byName.Altaria }),
            new Pokemon({ ...this.pokemonIndex.byName.Flagadoss }),
            new Pokemon({ ...this.pokemonIndex.byName.Absol }),
            new Pokemon({ ...this.pokemonIndex.byName.Steelix }),
            new Pokemon({ ...this.pokemonIndex.byName.Ptera }),
            new Pokemon({ ...this.pokemonIndex.byName.Kangourex }),
            new Pokemon({ ...this.pokemonIndex.byName.Latias }),
            new Pokemon({ ...this.pokemonIndex.byName.Latios }),
            new Pokemon({ ...this.pokemonIndex.byName.Cizayox }),
            new Pokemon({ ...this.pokemonIndex.byName.Alakazam }),
            new Pokemon({ ...this.pokemonIndex.byName.Branette }),
            new Pokemon({ ...this.pokemonIndex.byName.Laggron }),
            new Pokemon({ ...this.pokemonIndex.byName.Jungko }),
            new Pokemon({ ...this.pokemonIndex.byName.Brasegali }),
            new Pokemon({ ...this.pokemonIndex.byName.Oniglali }),
            new Pokemon({ ...this.pokemonIndex.byName.Drattak }),
            new Pokemon({ ...this.pokemonIndex.byName.Gardevoir }),
            new Pokemon({ ...this.pokemonIndex.byName.Charmina }),
            new Pokemon({ ...this.pokemonIndex.byName.Scarabrute }),
            new Pokemon({ ...this.pokemonIndex.byName.Tenefix }),
            new Pokemon({ ...this.pokemonIndex.byName.Tyranocif }),
            new Pokemon({ ...this.pokemonIndex.byName.Diancie }),
            new Pokemon({ ...this.pokemonIndex.byName.Carchacrok }),
            new Pokemon({ ...this.pokemonIndex.byName.Scarhino }),
            new Pokemon({ ...this.pokemonIndex.byName.Lucario }),
            new Pokemon({ ...this.pokemonIndex.byName.Mysdibule }),
            new Pokemon({ ...this.pokemonIndex.byName.Gallame }),
        ];
        listBase.push(
            new Pokemon({
                ...this.pokemonIndex.byName.Dracaufeu,
                name: 'Dracofeu-X',
                type: ['Feu', 'Dragon'],
                id: 10034,
            }),
        );
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Dracaufeu, name: 'Dracofeu-Y', id: 10035 }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Leviator, type: ['Eau', 'Ténèbres'] }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Kyogre, type: ['Eau', 'Insecte', 'Électrik'] }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Groudon, type: ['Feu', 'Sol', 'Plante'] }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Rayquaza, type: ['Dragon', 'Vol', 'Psy'] }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Nanmeouie, type: ['Normal', 'Fée'] }));
        listBase.push(new Pokemon({ ...this.pokemonIndex.byName.Galeking, type: ['Acier'] }));
        return listBase;
    }
}
