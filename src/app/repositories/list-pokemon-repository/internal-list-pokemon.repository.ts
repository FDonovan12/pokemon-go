import { inject, Injectable } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
interface InternalList {
    label: string;
    slug: string;
    aliases: string[];
    pokemons: PokemonInterface[];
}

@Injectable({
    providedIn: 'root',
})
export class InternalListPokemonRepository {
    private readonly _pokemonRepository: PokemonRepository = inject(PokemonRepository);

    private readonly internalLists: InternalList[] = [
        {
            label: 'Starter',
            slug: hash('internal_Starter'),
            aliases: ['starter', 'starters'],
            pokemons: [
                this._pokemonRepository.getPokemonByFamily('Bulbizarre'),
                this._pokemonRepository.getPokemonByFamily('Salameche'),
                this._pokemonRepository.getPokemonByFamily('Carapuce'),
                this._pokemonRepository.getPokemonByFamily('Germignon'),
                this._pokemonRepository.getPokemonByFamily('Hericendre'),
                this._pokemonRepository.getPokemonByFamily('Kaiminus'),
                this._pokemonRepository.getPokemonByFamily('Arcko'),
                this._pokemonRepository.getPokemonByFamily('Poussifeu'),
                this._pokemonRepository.getPokemonByFamily('Gobou'),
                this._pokemonRepository.getPokemonByFamily('Tortipouss'),
                this._pokemonRepository.getPokemonByFamily('Ouisticram'),
                this._pokemonRepository.getPokemonByFamily('Tiplouf'),
                this._pokemonRepository.getPokemonByFamily('Vipelierre'),
                this._pokemonRepository.getPokemonByFamily('Gruikui'),
                this._pokemonRepository.getPokemonByFamily('Moustillon'),
                this._pokemonRepository.getPokemonByFamily('Marisson'),
                this._pokemonRepository.getPokemonByFamily('Feunnec'),
                this._pokemonRepository.getPokemonByFamily('Grenousse'),
                this._pokemonRepository.getPokemonByFamily('Brindibou'),
                this._pokemonRepository.getPokemonByFamily('Flamiaou'),
                this._pokemonRepository.getPokemonByFamily('Otaquin'),
                this._pokemonRepository.getPokemonByFamily('Ouistempo'),
                this._pokemonRepository.getPokemonByFamily('Flambino'),
                this._pokemonRepository.getPokemonByFamily('Larmeleon'),
                this._pokemonRepository.getPokemonByFamily('Poussacha'),
                this._pokemonRepository.getPokemonByFamily('Chochodile'),
                this._pokemonRepository.getPokemonByFamily('Coiffeton'),
            ].flat(),
        },
        {
            label: 'Légendaire',
            slug: hash('internal_Légendaire'),
            aliases: ['legendaire', 'legendary'],
            pokemons: [this._pokemonRepository.getAllPokemon().filter((pokemon) => pokemon.isLegendary)].flat(),
        },
        {
            label: 'Fabuleux',
            slug: hash('internal_Fabuleux'),
            aliases: ['mythique', 'mythical', 'fabuleux'],
            pokemons: [this._pokemonRepository.getAllPokemon().filter((pokemon) => pokemon.isMythical)].flat(),
        },
        {
            label: 'Ultra chimere',
            slug: hash('internal_Ultra chimere'),
            aliases: ['ultra-chimere', 'ultrachimere', 'chimere'],
            pokemons: [
                this._pokemonRepository.getPokemonByFamily('Zeroid'),
                this._pokemonRepository.getPokemonByFamily('Mouscoto'),
                this._pokemonRepository.getPokemonByFamily('Cancrelove'),
                this._pokemonRepository.getPokemonByFamily('Cablifere'),
                this._pokemonRepository.getPokemonByFamily('Bamboiselle'),
                this._pokemonRepository.getPokemonByFamily('Katagami'),
                this._pokemonRepository.getPokemonByFamily('Engloutyran'),
                this._pokemonRepository.getPokemonByFamily('Ama-ama'),
                this._pokemonRepository.getPokemonByFamily('Pierroteknik'),
            ].flat(),
        },
        {
            label: 'Regional',
            slug: hash('internal_Regional'),
            aliases: ['regional'],
            pokemons: [
                this._pokemonRepository.getPokemonByFamily('Canarticho'),
                this._pokemonRepository.getPokemonByFamily('Kangourex'),
                this._pokemonRepository.getPokemonByFamily('Mime-jr'),
                this._pokemonRepository.getPokemonByFamily('Tauros'),
                this._pokemonRepository.getPokemonByFamily('Scarhino'),
                this._pokemonRepository.getPokemonByFamily('Corayon'),
                this._pokemonRepository.getPokemonByFamily('Chartor'),
                this._pokemonRepository.getPokemonByFamily('Tropius'),
                this._pokemonRepository.getPokemonByFamily('Relicanth'),
                this._pokemonRepository.getPokemonByFamily('Pachirisu'),
                this._pokemonRepository.getPokemonByFamily('Pijako'),
                this._pokemonRepository.getPokemonByFamily('Vortente'),
                this._pokemonRepository.getPokemonByFamily('Maracachi'),
                this._pokemonRepository.getPokemonByFamily('Cryptero'),
                this._pokemonRepository.getPokemonByFamily('Muciole'),
                this._pokemonRepository.getPokemonByFamily('Lumivole'),
                this._pokemonRepository.getPokemonByFamily('Seviper'),
                this._pokemonRepository.getPokemonByFamily('Mangriff'),
                this._pokemonRepository.getPokemonByFamily('Solaroc'),
                this._pokemonRepository.getPokemonByFamily('Seleroc'),
                this._pokemonRepository.getPokemonByFamily('Sancoki'),
                this._pokemonRepository.getPokemonByFamily('Karaclee'),
                this._pokemonRepository.getPokemonByFamily('Judokrak'),
                this._pokemonRepository.getPokemonByFamily('Bargantua'),
                this._pokemonRepository.getPokemonByFamily('Aflamanoir'),
                this._pokemonRepository.getPokemonByFamily('Fermite'),
                this._pokemonRepository.getPokemonByFamily('Crefadet'),
                this._pokemonRepository.getPokemonByFamily('Crefollet'),
                this._pokemonRepository.getPokemonByFamily('Crehelf'),
                this._pokemonRepository.getPokemonByFamily('Flamajou'),
                this._pokemonRepository.getPokemonByFamily('Flotajou'),
                this._pokemonRepository.getPokemonByFamily('Feuillajou'),
                this._pokemonRepository.getPokemonByFamily('Mouscoto'),
                this._pokemonRepository.getPokemonByFamily('Cancrelove'),
                this._pokemonRepository.getPokemonByFamily('Cablifere'),
                this._pokemonRepository.getPokemonByFamily('Bamboiselle'),
                this._pokemonRepository.getPokemonByFamily('Katagami'),
                this._pokemonRepository.getPokemonByFamily('Ama-ama'),
                this._pokemonRepository.getPokemonByFamily('Pierroteknik'),
            ].flat(),
        },
    ];

    getInternalLists(): LabelEntry[] {
        return this.internalLists.map((list) => ({ label: list.label, slug: list.slug }) as LabelEntry);
    }
    getPokemonsForInternalList(entry: LabelEntry | { slug: string }): PokemonInterface[] | undefined {
        return this.internalLists.find((list) => list.slug === entry.slug)?.pokemons;
    }
    getPokemonsForInternalListBySearch(search: string): PokemonInterface[] | undefined {
        return this.internalLists.find((list) => list.aliases.slugifyIncludes(search))?.pokemons;
    }
}
function hash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return 'internal_' + Math.abs(h).toString(36);
}
