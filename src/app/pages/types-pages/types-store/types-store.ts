import { computed, effect, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';

const initialState = {
    pokemonTypeCount: new Map<TypePokemon, Map<TypePokemon, number>>(),
    currentTeamBuilded: new Set<TypePokemon>(),
};

export const TypesStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _typeEffectivenessService: inject(TypeEffectivenessService),
        _pokemonRepository: inject(PokemonRepository),
        _localStorageService: inject(LocalStorageService),
    })),
    withState(initialState),
    withComputed((store) => ({
        coverageAllTypes: computed(() => makeCoverageStats(store.pokemonTypeCount(), store._typeEffectivenessService)),
        coverageAllTypesDouble: computed(() =>
            makeCoverageStats(store.pokemonTypeCount(), store._typeEffectivenessService, allTypes, 4),
        ),
        coverageTeam: computed(() =>
            makeCoverageStats(store.pokemonTypeCount(), store._typeEffectivenessService, store.currentTeamBuilded()),
        ),
        coverageTeamDouble: computed(() =>
            makeCoverageStats(store.pokemonTypeCount(), store._typeEffectivenessService, store.currentTeamBuilded(), 4),
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
        toggleTeamAll() {
            let currentTeamBuilded: Set<TypePokemon>;
            if (store.currentTeamBuilded().size === allTypes.length) {
                currentTeamBuilded = new Set();
            } else {
                currentTeamBuilded = new Set(allTypes);
            }
            patchState(store, { currentTeamBuilded: currentTeamBuilded });
        },
    })),
    withHooks((store) => ({
        onInit() {
            const legendaryPokemon = Object.entries(store._pokemonRepository.pokemonIndex.byName)
                .map(([key, pokemon]) => pokemon)
                .filter((pokemon) => pokemon.isLegendary);
            const megaPokemon = store._pokemonRepository.megaList;
            const megaAndLegendaryPokemon = megaPokemon.concat(legendaryPokemon);

            const pokemonTypeCount = initTypeTable();

            megaAndLegendaryPokemon.forEach((pokemon) =>
                incrementTable(pokemonTypeCount, pokemon.type[0], pokemon.type[1]),
            );
            effect(() => {
                store._localStorageService.set('currentTeamBuilded', Array.from(store.currentTeamBuilded()));
            });
            const currentTeamBuilded = store._localStorageService.get<string[]>('currentTeamBuilded', []).toSet();
            patchState(store, {
                pokemonTypeCount: pokemonTypeCount,
                currentTeamBuilded: currentTeamBuilded,
            });
        },
    })),
);

function makeCoverageStats(
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessService: TypeEffectivenessService,
    coverage: Set<TypePokemon> | TypePokemon[] = allTypes,
    minEffectiveness = 2,
) {
    const generalMapCoverge = buildGridCountEffectiveness(
        pokemonTypeCount,
        typeEffectivenessService,
        coverage,
        minEffectiveness,
    );
    const totalPerTypeDefensive = getTotalCountPerType(generalMapCoverge);
    const total = getTotalCount(generalMapCoverge);
    const totalPerTypeOffensive = buildMapEffectiveness(pokemonTypeCount, typeEffectivenessService, minEffectiveness);
    return { totalPerTypeDefensive, total, totalPerTypeOffensive };
}

function buildMapEffectiveness(
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessService: TypeEffectivenessService,
    minEffectiveness = 2,
) {
    const result = new Map<TypePokemon, number>();
    for (const type2 of allTypes) {
        result.set(type2, 0);
    }
    for (const type1 of allTypes) {
        for (const type2 of allTypes) {
            for (const attacker of allTypes) {
                if (typeEffectivenessService.calculEffectivness(attacker, type1, type2) >= minEffectiveness) {
                    result.set(attacker, (result.get(attacker) ?? 0) + (pokemonTypeCount.get(type1)?.get(type2) ?? 0));
                }
            }
        }
    }
    return result;
}

function buildGridCountEffectiveness(
    pokemonTypeCount: Map<TypePokemon, Map<TypePokemon, number>>,
    typeEffectivenessService: TypeEffectivenessService,
    coverage: Set<TypePokemon> | TypePokemon[],
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
