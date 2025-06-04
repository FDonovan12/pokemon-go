import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons.json';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';

const pokemonsList = pokemonsData as PokemonInterface[];

type Pokemon = (typeof pokemonsList | typeof pokemonsListHomeMade)[number];

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
        listHomemade: readonly Pokemon[] = [],
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
            this.pokemonIndex.byName.Florizarre,
            this.pokemonIndex.byName.Tortank,
            this.pokemonIndex.byName.Dardargnan,
            this.pokemonIndex.byName.Roucarnage,
            this.pokemonIndex.byName.Ectoplasma,
            this.pokemonIndex.byName.Demolosse,
            this.pokemonIndex.byName.Blizzaroi,
            this.pokemonIndex.byName.Pharamp,
            this.pokemonIndex.byName.Elecsprint,
            this.pokemonIndex.byName.Lockpin,
            this.pokemonIndex.byName.Altaria,
            this.pokemonIndex.byName.Flagadoss,
            this.pokemonIndex.byName.Absol,
            this.pokemonIndex.byName.Steelix,
            this.pokemonIndex.byName.Ptera,
            this.pokemonIndex.byName.Kangourex,
            this.pokemonIndex.byName.Latias,
            this.pokemonIndex.byName.Latios,
            this.pokemonIndex.byName.Cizayox,
            this.pokemonIndex.byName.Alakazam,
            this.pokemonIndex.byName.Galeking,
            this.pokemonIndex.byName.Branette,
            this.pokemonIndex.byName.Laggron,
            this.pokemonIndex.byName.Jungko,
            this.pokemonIndex.byName.Brasegali,
            this.pokemonIndex.byName.Oniglali,
            this.pokemonIndex.byName.Drattak,
            this.pokemonIndex.byName.Gardevoir,
            this.pokemonIndex.byName.Charmina,
            this.pokemonIndex.byName.Scarabrute,
            this.pokemonIndex.byName.Tenefix,
            this.pokemonIndex.byName.Tyranocif,
            this.pokemonIndex.byName.Rayquaza,
            this.pokemonIndex.byName.Diancie,
            this.pokemonIndex.byName.Carchacrok,
            this.pokemonIndex.byName.Scarhino,
            this.pokemonIndex.byName.Lucario,
            this.pokemonIndex.byName.Mysdibule,
            this.pokemonIndex.byName.Gallame,
        ];
        listBase.push({ ...this.pokemonIndex.byName.Dracaufeu, name: 'Dracofeu-X', type: ['Feu', 'Dragon'] });
        listBase.push({ ...this.pokemonIndex.byName.Dracaufeu, name: 'Dracofeu-Y' });
        listBase.push({ ...this.pokemonIndex.byName.Leviator, type: ['Eau', 'Ténèbres'] });
        listBase.push({ ...this.pokemonIndex.byName.Kyogre, type: ['Eau', 'Insecte', 'Électrik'] });
        listBase.push({ ...this.pokemonIndex.byName.Groudon, type: ['Feu', 'Sol', 'Plante'] });
        listBase.push({ ...this.pokemonIndex.byName.Rayquaza, type: ['Dragon', 'Vol', 'Psy'] });
        listBase.push({ ...this.pokemonIndex.byName.Nanmeouie, type: ['Normal', 'Fée'] });
        return listBase;
    }
}
