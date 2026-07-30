import { computed, inject, Injectable } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { PokemonData, PokemonFamily } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
interface InternalListDef {
    label: string;
    slug: string;
    aliases: string[];
    matches: (pokemon: PokemonData) => boolean;
}

const byFamily = (families: PokemonFamily[]) => (pokemon: PokemonData) => families.slugifyIncludes(pokemon.family);

@Injectable({ providedIn: 'root' })
export class InternalListPokemonRepository {
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);

    private readonly internalLists: InternalListDef[] = [
        {
            label: 'Starter',
            slug: hash('internal_Starter'),
            aliases: ['starter', 'starters'],
            matches: byFamily([
                'Bulbizarre',
                'Salameche',
                'Carapuce',
                'Germignon',
                'Hericendre',
                'Kaiminus',
                'Arcko',
                'Poussifeu',
                'Gobou',
                'Tortipouss',
                'Ouisticram',
                'Tiplouf',
                'Vipelierre',
                'Gruikui',
                'Moustillon',
                'Marisson',
                'Feunnec',
                'Grenousse',
                'Brindibou',
                'Flamiaou',
                'Otaquin',
                'Ouistempo',
                'Flambino',
                'Larmeleon',
                'Poussacha',
                'Chochodile',
                'Coiffeton',
            ]),
        },
        {
            label: 'Légendaire',
            slug: hash('internal_Légendaire'),
            aliases: ['legendaire', 'legendary'],
            matches: (pokemon) => pokemon.isLegendary,
        },
        {
            label: 'Fabuleux',
            slug: hash('internal_Fabuleux'),
            aliases: ['mythique', 'mythical', 'fabuleux'],
            matches: (pokemon) => pokemon.isMythical,
        },
        {
            label: 'Ultra chimere',
            slug: hash('internal_Ultra chimere'),
            aliases: ['ultra-chimere', 'ultrachimere', 'chimere'],
            matches: byFamily([
                'Zeroid',
                'Mouscoto',
                'Cancrelove',
                'Cablifere',
                'Bamboiselle',
                'Katagami',
                'Engloutyran',
                'Ama-ama',
                'Pierroteknik',
            ]),
        },
        {
            label: 'Regional',
            slug: hash('internal_Regional'),
            aliases: ['regional'],
            matches: byFamily([
                'Canarticho',
                'Kangourex',
                'Mime-jr',
                'Tauros',
                'Scarhino',
                'Corayon',
                'Chartor',
                'Tropius',
                'Relicanth',
                'Pachirisu',
                'Pijako',
                'Vortente',
                'Maracachi',
                'Cryptero',
                'Muciole',
                'Lumivole',
                'Seviper',
                'Mangriff',
                'Solaroc',
                'Seleroc',
                'Sancoki',
                'Karaclee',
                'Judokrak',
                'Bargantua',
                'Aflamanoir',
                'Fermite',
                'Crefadet',
                'Crefollet',
                'Crehelf',
                'Flamajou',
                'Flotajou',
                'Feuillajou',
                'Mouscoto',
                'Cancrelove',
                'Cablifere',
                'Bamboiselle',
                'Katagami',
                'Ama-ama',
                'Pierroteknik',
            ]),
        },
    ];
    private readonly _pokemonSource = computed<PokemonData[]>(() => {
        const remote = this._pokemonRepository.allDifferentFormPokemonsSetting.value();
        return remote.length > 0 ? remote : this._pokemonRepository.getAllPokemon();
    });

    getInternalLists(): LabelEntry[] {
        return this.internalLists.map((list) => ({ label: list.label, slug: list.slug }) as LabelEntry);
    }

    getPokemonsForInternalList(entry: LabelEntry | { slug: string }): PokemonData[] {
        const list = this.internalLists.find((l) => l.slug === entry.slug);
        return list ? this._pokemonSource().filter(list.matches) : [];
    }

    getPokemonsForInternalListBySearch(search: string): PokemonData[] {
        const list = this.internalLists.find((l) => l.aliases.slugifyIncludes(search));
        return list ? this._pokemonSource().filter(list.matches) : [];
    }
}
function hash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return 'internal_' + Math.abs(h).toString(36);
}
