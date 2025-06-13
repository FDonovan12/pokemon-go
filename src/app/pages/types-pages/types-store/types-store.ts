import { computed, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';

const initialState = {
    pokemonTypeCount: new Map<TypePokemon, Map<TypePokemon, number>>(),
    currentTeamBuilded: new Set<TypePokemon>(),
};

export const TypesStore = signalStore(
    withState(initialState),
    withComputed((store, typeEffectivenessService = inject(TypeEffectivenessService)) => ({
        coverageAllTypes: computed(() =>
            makeCoverageStats(allTypes, store.pokemonTypeCount(), typeEffectivenessService),
        ),
        coverageAllTypesDouble: computed(() =>
            makeCoverageStats(allTypes, store.pokemonTypeCount(), typeEffectivenessService, 4),
        ),
        coverageTeam: computed(() =>
            makeCoverageStats(store.currentTeamBuilded(), store.pokemonTypeCount(), typeEffectivenessService),
        ),
        coverageTeamDouble: computed(() =>
            makeCoverageStats(store.currentTeamBuilded(), store.pokemonTypeCount(), typeEffectivenessService, 4),
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
    })),
    withHooks(
        (
            store,
            pokemonRepository = inject(PokemonRepository),
            typeEffectivenessService = inject(TypeEffectivenessService),
        ) => ({
            async onInit() {
                await typeEffectivenessService.initIfNeeded();
                const legendaryPokemon = Object.entries(pokemonRepository.pokemonIndex.byName)
                    .map(([key, pokemon]) => pokemon)
                    .filter((pokemon) => pokemon.isLegendary);
                const megaPokemon = pokemonRepository.megaList;
                const megaAndLegendaryPokemon = megaPokemon.concat(legendaryPokemon);

                const pokemonTypeCount = initTypeTable();

                megaAndLegendaryPokemon.forEach((pokemon) =>
                    incrementTable(pokemonTypeCount, pokemon.type[0], pokemon.type[1]),
                );
                patchState(store, {
                    pokemonTypeCount: pokemonTypeCount,
                });
            },
        }),
    ),
);

function makeCoverageStats(
    coverage: Set<TypePokemon> | TypePokemon[],
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessService: TypeEffectivenessService,
    minEffectiveness = 2,
) {
    const generalMap = buildGridCountEffectiveness(
        coverage,
        pokemonTypeCount,
        typeEffectivenessService,
        minEffectiveness,
    );
    const totalPerTypeDefensive = getTotalCountPerType(generalMap);
    const total = getTotalCount(generalMap);
    return { totalPerTypeDefensive, total };
}

function buildGridCountEffectiveness(
    coverage: Set<TypePokemon> | TypePokemon[],
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessService: TypeEffectivenessService,
    minEffectiveness: number = 2,
): Map<TypePokemon, Map<TypePokemon, number>> {
    const result = initTypeTable();
    for (const type1 of allTypes) {
        for (const type2 of allTypes) {
            let isSuperEffective = false;
            for (const attacker of coverage) {
                if (typeEffectivenessService.calculEffectivness(attacker, type1, type2) >= minEffectiveness) {
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

function getTotalCount(pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>) {
    let total = 0;
    for (const [defType1, subMap] of pokemonTypeCount) {
        for (const [defType2, count] of subMap) {
            total += count;
        }
    }
    return total;
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
