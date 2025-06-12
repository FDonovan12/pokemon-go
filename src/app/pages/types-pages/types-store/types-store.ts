import { computed, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

const initialState = {
    pokemonTypeCount: new Map<TypePokemon, Map<TypePokemon, number>>(),
    typeEffectivenessTable: new Map<TypePokemon, Map<TypePokemon, number>>(),
    currentTeamBuilded: new Set<TypePokemon>(),
};

export const TypesStore = signalStore(
    withState(initialState),
    withComputed((store) => ({
        countSuperEffective: computed(() =>
            computeSuperEffectiveTargets(store.typeEffectivenessTable(), store.pokemonTypeCount()),
        ),
        base: computed(() => {
            const generalMap = name(allTypes, store.typeEffectivenessTable(), store.pokemonTypeCount());
            const totalPerTypeDefensive = getTotalCountPerType(generalMap);
            const total = getTotalCount(generalMap);
            return {
                totalPerTypeDefensive,
                total,
            };
        }),
        baseDouble: computed(() => {
            const generalMap = name(allTypes, store.typeEffectivenessTable(), store.pokemonTypeCount(), 4);
            const totalPerTypeDefensive = getTotalCountPerType(generalMap);
            const total = getTotalCount(generalMap);
            return {
                totalPerTypeDefensive,
                total,
            };
        }),
        test: computed(() => {
            const generalMap = name(
                store.currentTeamBuilded(),
                store.typeEffectivenessTable(),
                store.pokemonTypeCount(),
            );
            const totalPerTypeDefensive = getTotalCountPerType(generalMap);
            const total = getTotalCount(generalMap);
            return {
                totalPerTypeDefensive,
                total,
            };
        }),
        testDouble: computed(() => {
            const generalMap = name(
                store.currentTeamBuilded(),
                store.typeEffectivenessTable(),
                store.pokemonTypeCount(),
                4,
            );
            const totalPerTypeDefensive = getTotalCountPerType(generalMap);
            const total = getTotalCount(generalMap);
            return {
                totalPerTypeDefensive,
                total,
            };
        }),
    })),
    withMethods((store) => ({
        toggleTeam(team: TypePokemon) {
            const currentTeamBuilded = new Set(store.currentTeamBuilded());
            if (currentTeamBuilded.has(team)) {
                currentTeamBuilded.delete(team);
            } else {
                currentTeamBuilded.add(team);
            }
            patchState(store, { currentTeamBuilded: currentTeamBuilded });
        },
    })),
    withHooks((store, pokemonRepository = inject(PokemonRepository)) => ({
        async onInit() {
            const legendaryPokemon = Object.entries(pokemonRepository.pokemonIndex.byName)
                .map(([key, pokemon]) => pokemon)
                .filter((pokemon) => pokemon.isLegendary);
            const megaPokemon = pokemonRepository.megaList;
            const megaAndLegendaryPokemon = megaPokemon.concat(legendaryPokemon);

            const pokemonTypeCount = initTypeTable();
            const typeEffectivenessTable = await fetchDamageRelations();

            megaAndLegendaryPokemon.forEach((pokemon) =>
                incrementTable(pokemonTypeCount, pokemon.type[0], pokemon.type[1]),
            );
            patchState(store, { pokemonTypeCount: pokemonTypeCount, typeEffectivenessTable: typeEffectivenessTable });
        },
    })),
);

function name(
    coverage: Set<TypePokemon> | TypePokemon[],
    typeEffectiveness: Map<TypePokemon, Map<TypePokemon, number>>,
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    minEffectiveness: number = 2,
): Map<TypePokemon, Map<TypePokemon, number>> {
    const result = initTypeTable();
    for (const type1 of allTypes) {
        for (const type2 of allTypes) {
            let isSuperEffective = false;
            for (const attacker of coverage) {
                if (calculEffectivness(attacker, typeEffectiveness, type1, type2) >= minEffectiveness) {
                    isSuperEffective = true;
                }
            }
            if (isSuperEffective) {
                const firstTypeMap = result.get(type1);
                const secondTypeCount = firstTypeMap?.get(type2);
                firstTypeMap?.set(type2, (secondTypeCount ?? 0) + (pokemonTypeCount.get(type1)?.get(type2) ?? 0));
            }
        }
    }
    return result;
}

function initTypeTable(): Map<TypePokemon, Map<TypePokemon, number>> {
    const typeTable = new Map<TypePokemon, Map<TypePokemon, number>>();
    for (const type1 of allTypes) {
        const innerMap = new Map<TypePokemon, number>();
        for (const type2 of allTypes) {
            innerMap.set(type2, 0);
        }
        typeTable.set(type1, innerMap);
    }
    return typeTable;
}

function getTotalCountPerType(pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>): Map<TypePokemon, number> {
    const result = new Map<TypePokemon, number>();

    for (const [type1, innerMap] of pokemonTypeCount) {
        for (const [type2, count] of innerMap) {
            if (type1 === type2) {
                result.set(type1, (result.get(type1) ?? 0) + count);
            } else {
                result.set(type1, (result.get(type1) ?? 0) + count);
                result.set(type2, (result.get(type2) ?? 0) + count);
            }
        }
    }

    return result;
}

function incrementTable(
    table: Map<TypePokemon, Map<TypePokemon, number>>,
    attacker: TypePokemon,
    defender: TypePokemon,
) {
    const firstType = attacker;
    const secondType = defender ?? firstType;
    const firstTypeMap = table.get(firstType);
    const secondTypeCount = firstTypeMap?.get(secondType);
    firstTypeMap?.set(secondType, (secondTypeCount ?? 0) + 1);
}

function computeSuperEffectiveTargets(
    typeEffectiveness: Map<TypePokemon, Map<TypePokemon, number>>,
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    minEffectiveness: number = 2,
): Map<TypePokemon, number> {
    const result = new Map<TypePokemon, number>();

    for (const attacker of allTypes) {
        let total = calculTotalEffectivness(attacker, typeEffectiveness, pokemonTypeCount, minEffectiveness);

        result.set(attacker, total);
    }

    return result;
}

function getTotalCount(pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>) {
    let total = 0;
    for (const [defType1, subMap] of pokemonTypeCount) {
        for (const [defType2, count] of subMap) {
            total += count;
        }
    }
    return total;
}

function calculEffectivness(
    attacker: TypePokemon,
    typeEffectiveness: Map<TypePokemon, Map<TypePokemon, number>>,
    type1: TypePokemon,
    type2: TypePokemon,
) {
    const eff1 = typeEffectiveness.get(attacker)?.get(type1) ?? 1;
    const eff2 = typeEffectiveness.get(attacker)?.get(type2) ?? 1;
    const combinedEff = eff1 * eff2;
    return combinedEff;
}

function calculTotalEffectivness(
    attacker: TypePokemon,
    typeEffectiveness: Map<TypePokemon, Map<TypePokemon, number>>,
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    minEffectiveness: number = 2,
) {
    let total = 0;

    for (const type1 of allTypes) {
        for (const type2 of allTypes) {
            const count = pokemonTypeCount.get(type1)?.get(type2) ?? 0;
            if (count === 0) continue;
            const combinedEff = calculEffectivness(attacker, typeEffectiveness, type1, type2);

            if (combinedEff >= minEffectiveness) {
                total += count;
            }
        }
    }
    return total;
}

async function fetchDamageRelations() {
    const typesCount = new Map<TypePokemon, Map<TypePokemon, number>>();

    for (const [frType, enType] of Object.entries(typeMapFrToEn)) {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${enType}`);
        const data = await response.json();

        const innerMap = new Map<TypePokemon, number>();

        // Init à 1 par défaut (neutre)
        for (const defType of Object.keys(typeMapFrToEn) as TypePokemon[]) {
            innerMap.set(defType, 1);
        }

        const update = (arr: any[], value: number) => {
            for (const type of arr) {
                const targetFr = Object.entries(typeMapFrToEn).find(([, v]) => v === type.name)?.[0];
                if (targetFr) innerMap.set(targetFr as TypePokemon, value);
            }
        };

        update(data.damage_relations.double_damage_to, 2);
        update(data.damage_relations.half_damage_to, 0.5);
        update(data.damage_relations.no_damage_to, 0);

        typesCount.set(frType as TypePokemon, innerMap);
    }

    return typesCount;
}

const typeMapFrToEn: Record<TypePokemon, string> = {
    Acier: 'steel',
    Combat: 'fighting',
    Dragon: 'dragon',
    Eau: 'water',
    Électrik: 'electric',
    Fée: 'fairy',
    Feu: 'fire',
    Glace: 'ice',
    Insecte: 'bug',
    Normal: 'normal',
    Plante: 'grass',
    Poison: 'poison',
    Psy: 'psychic',
    Roche: 'rock',
    Sol: 'ground',
    Spectre: 'ghost',
    Ténèbres: 'dark',
    Vol: 'flying',
};
