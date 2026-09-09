import { computed, inject, Injectable } from '@angular/core';
import { LabelEntry } from '@entities/label';
import { Base, PokemonFamily } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

interface InternalListDef {
    label: string;
    slug: string;
    aliases: string[];
    matches: (pokemon: Base) => boolean;
}

const byFamily = (families: PokemonFamily[]) => (pokemon: Base) => families.slugifyIncludes(pokemon.family);
const byFamilyOf = (baseMatcher: (pokemon: Base) => boolean, getSource: () => Base[]) => (pokemon: Base) => {
    const families = new Set(
        getSource()
            .filter(baseMatcher)
            .map((p) => p.family),
    );
    return families.has(pokemon.family);
};

const getRootId = (pokemon: Base, byId: Map<string, Base>): string => {
    let current = pokemon;
    while (current.parentPokemonId != null) {
        const parent = byId.get(current.parentPokemonId);
        if (!parent) break; // parent introuvable dans la source, on s'arrête là où on est
        current = parent;
    }
    return current.pokemonId;
};

const byRootOf = (baseMatcher: (pokemon: Base) => boolean, getSource: () => Base[]) => (pokemon: Base) => {
    const source = getSource();
    const byId = new Map(source.map((p) => [p.pokemonId, p]));
    const rootIds = new Set(source.filter(baseMatcher).map((p) => getRootId(p, byId)));
    return rootIds.has(getRootId(pokemon, byId));
};

interface EvolutionRef {
    pokemonId: string;
    form: string;
}
// Base est supposé avoir : pokemonId, form, parentPokemonId, evolutionIds?: EvolutionRef[]

const keyOf = (pokemon: Base) => `${pokemon.pokemonId}_${pokemon.form}`;

const findParent = (child: Base, source: Base[]): Base | undefined => {
    if (child.parentPokemonId == null) return undefined;
    return source.find(
        (candidate) =>
            candidate.pokemonId === child.parentPokemonId &&
            candidate.evolutionIds?.some((evo) => evo.pokemonId === child.pokemonId && evo.form === child.form),
    );
};

const getAncestorChainKeys = (pokemon: Base, source: Base[]): string[] => {
    const keys: string[] = [keyOf(pokemon)];
    let current = pokemon;
    while (true) {
        const parent = findParent(current, source);
        if (!parent) break;
        keys.push(keyOf(parent));
        current = parent;
    }
    return keys;
};

const byLineageOf = (baseMatcher: (pokemon: Base) => boolean, getSource: () => Base[]) => (pokemon: Base) => {
    const source = getSource();
    const matched = source.filter(baseMatcher);
    const familyKeys = new Set(matched.flatMap((p) => getAncestorChainKeys(p, source)));
    return familyKeys.has(keyOf(pokemon));
};

const and =
    (...matchers: Array<(pokemon: Base) => boolean>) =>
    (pokemon: Base) =>
        matchers.every((m) => m(pokemon));

const or =
    (...matchers: Array<(pokemon: Base) => boolean>) =>
    (pokemon: Base) =>
        matchers.some((m) => m(pokemon));

const not = (matcher: (pokemon: Base) => boolean) => (pokemon: Base) => !matcher(pokemon);

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
        {
            label: 'Mega',
            slug: hash('internal_mega'),
            aliases: ['mega'],
            matches: byLineageOf(
                (pokemon) => pokemon.hasMega,
                () => this._pokemonSource(),
            ),
        },
    ];

    private readonly _pokemonSource = computed<Base[]>(() => {
        return this._pokemonRepository.allDifferentFormPokemonsSetting.value();
    });

    getInternalLists(): LabelEntry[] {
        return this.internalLists.map((list) => ({ label: list.label, slug: list.slug }) as LabelEntry);
    }

    getPokemonsForInternalList(entry: LabelEntry | { slug: string }): Base[] | undefined {
        const list = this.internalLists.find((l) => l.slug === entry.slug);
        return list ? this._pokemonSource().filter(list.matches) : undefined;
    }

    getPokemonsForInternalListBySearch(search: string): Base[] | undefined {
        const list = this.internalLists.find((l) => l.aliases.slugifyIncludes(search));
        return list ? this._pokemonSource().filter(list.matches) : undefined;
    }
}

function hash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return 'internal_' + Math.abs(h).toString(36);
}
