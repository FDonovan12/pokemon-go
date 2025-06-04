import { Injectable } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';
import pokemonsData from 'app/bdd/bdd-pokemons.json';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';

// export interface PokemonInterface {
//     id: number;
//     name: string;
//     image: string;
//     sprite: string;
//     slug: string;
//     type: readonly typePokemon[];
// }

const pokemonsList = pokemonsData as PokemonInterface[];

type Pokemon = (typeof pokemonsList | typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['id'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};
@Injectable({
    providedIn: 'root',
})
export class GetAllService {
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
    megaList = this.buildMegaList();
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
    }

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
