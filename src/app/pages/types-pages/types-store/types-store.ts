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
        typeRows: computed(() => {
            return allTypes.map((attacker) => ({
                attacker,
                values: allTypes.map((defender) => ({
                    defender,
                    count: store.pokemonTypeCount().get(attacker)?.get(defender) ?? -1,
                })),
            }));
        }),
        resitantRows: computed(() => {
            return allTypes.map((attacker) => ({
                attacker,
                values: allTypes.map((defender) => ({
                    defender,
                    count: store.typeEffectivenessTable().get(attacker)?.get(defender) ?? -1,
                })),
            }));
        }),
        countSuperEffective: computed(() =>
            allTypes.map((attacker) => ({
                attacker,
                values:
                    computeSuperEffectiveTargets(store.typeEffectivenessTable(), store.pokemonTypeCount()).get(
                        attacker,
                    ) ?? -1,
            })),
        ),
        countDoubleSuperEffective: computed(() =>
            allTypes.map((attacker) => ({
                attacker,
                values:
                    computeSuperEffectiveTargets(store.typeEffectivenessTable(), store.pokemonTypeCount(), 4).get(
                        attacker,
                    ) ?? -1,
            })),
        ),
        myTeamsEffectiveness: computed(() =>
            allTypes.map((attacker) => ({
                attacker,
                values:
                    computeSuperEffectiveTargets(store.typeEffectivenessTable(), store.pokemonTypeCount()).get(
                        attacker,
                    ) ?? -1,
            })),
        ),
        myTeamsDoubleEffectiveness: computed(() =>
            allTypes.map((attacker) => ({
                attacker,
                values:
                    computeSuperEffectiveTargets(store.typeEffectivenessTable(), store.pokemonTypeCount(), 4).get(
                        attacker,
                    ) ?? -1,
            })),
        ),
        getTotalTeamsEffectiveness: computed(() =>
            countSuperEffectiveCoverage(
                store.pokemonTypeCount(),
                store.typeEffectivenessTable(),
                store.currentTeamBuilded(),
            ),
        ),
        getTotalTeamsDoubleEffectiveness: computed(() =>
            countSuperEffectiveCoverage(
                store.pokemonTypeCount(),
                store.typeEffectivenessTable(),
                store.currentTeamBuilded(),
                4,
            ),
        ),
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
        getTotalType() {
            return new Map(store.typeRows().map((rows) => [rows.attacker, rows.values.sum((col) => col.count)]));
        },
        getTotalEffective() {
            return countSuperEffectiveCoverage(store.pokemonTypeCount(), store.typeEffectivenessTable(), allTypes, 2);
        },
        getTotalDoubleEffective() {
            return countSuperEffectiveCoverage(store.pokemonTypeCount(), store.typeEffectivenessTable(), allTypes, 4);
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
        let total = calculEffectivness(attacker, typeEffectiveness, pokemonTypeCount, minEffectiveness);

        result.set(attacker, total);
    }

    return result;
}
function countSuperEffectiveCoverage(
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessTable: Map<TypePokemon, Map<TypePokemon, number>>,
    currentTeamBuilded: Set<TypePokemon> | TypePokemon[],
    minEffectiveness: number = 2,
): number {
    let total = 0;

    for (const [defType1, subMap] of pokemonTypeCount) {
        for (const [defType2, count] of subMap) {
            let isSuperEffective = false;

            for (const attacker of currentTeamBuilded) {
                const attackerMap = typeEffectivenessTable.get(attacker);
                if (!attackerMap) continue;

                const eff1 = attackerMap.get(defType1) ?? 1;
                const eff2 = attackerMap.get(defType2) ?? 1;
                const totalEffectiveness = eff1 * eff2;

                if (totalEffectiveness >= minEffectiveness) {
                    isSuperEffective = true;
                    break; // Pas besoin de tester les autres attaquants
                }
            }

            if (isSuperEffective) {
                total += count;
            }
        }
    }

    return total;
}

function calculEffectivness(
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

            const eff1 = typeEffectiveness.get(attacker)?.get(type1) ?? 1;
            const eff2 = typeEffectiveness.get(attacker)?.get(type2) ?? 1;
            const combinedEff = eff1 * eff2;

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
