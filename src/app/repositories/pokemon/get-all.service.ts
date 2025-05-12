import { Injectable } from '@angular/core';
import { pokemonsList } from '../../bdd/bdd-pokemons';

export interface PokemonInterface {
    id: number;
    name: string;
    image: string;
    sprite: string;
    slug: string;
    type: readonly string[];
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
        byName: Object.fromEntries(list.map((p) => [p.slug, p])) as Record<Pokemon['slug'], Pokemon>,
    });

    pokemonIndex = this.buildPokemonIndex(pokemonsList);
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
        listBase.push({ ...this.pokemonIndex.byName.Dracaufeu, name: 'Dracofeu-X', type: ['Feu', 'Dragon'] })
        listBase.push({ ...this.pokemonIndex.byName.Dracaufeu, name: 'Dracofeu-Y' })
        listBase.push({ ...this.pokemonIndex.byName.Leviator, type: ['Eau', 'Ténébre'] })
        listBase.push({ ...this.pokemonIndex.byName.Kyogre, type: ['Eau', 'Insecte', 'Electrik'] })
        listBase.push({ ...this.pokemonIndex.byName.Groudon, type: ['Feu', 'Sol', 'Plante'] })
        listBase.push({ ...this.pokemonIndex.byName.Rayquaza, type: ['Dragon', 'Vol', 'Psy'] })
        listBase.push({ ...this.pokemonIndex.byName.Nanmeouie, type: ['Normal', 'Fée'] })
        return listBase;
    }
}
