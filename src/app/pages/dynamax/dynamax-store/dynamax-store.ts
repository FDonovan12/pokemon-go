import { computed, inject } from '@angular/core';
import { allTypes, Dynamax, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonDynamaxRepository } from '@repositories/pokemon/pokemon-dynamax';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';

export type ResultDamage = {
    dynamax: Dynamax;
    damage: number;
    typeAttack: TypePokemon;
    isSelected?: boolean;
    isBadComparedToSelected?: boolean;
};

const resultDamageKey = (dynamax: Dynamax, typeAttack: TypePokemon) => `${dynamax.pokemon.dexNumber}-${typeAttack}`;

const initialState = {
    _selectedKeys: new Set<string>(),
    search: '',
};

export const DynamaxStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _typeEffectivenessService: inject(TypeEffectivenessService),
        _pokemonDynamaxRepository: inject(PokemonDynamaxRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        // Donnée brute, purement dérivée de finalDynamax() — jamais mutée
        _baseResultDamageByType: computed(() => {
            const dynamaxList = store._pokemonDynamaxRepository.finalDynamax();
            const map = new Map<TypePokemon, ResultDamage[]>();
            if (dynamaxList.length === 0) return map;

            allTypes.forEach((typeOpponent) => {
                const list: ResultDamage[] = [];
                dynamaxList.forEach((dynamax) => {
                    dynamax.attackType.forEach((typeAttack) => {
                        const typeAffinity = store._typeEffectivenessService.calculEffectivness(
                            typeAttack,
                            typeOpponent,
                            typeOpponent,
                        );
                        const stabMultiplier = dynamax.pokemon.type.includes(typeAttack) ? 1.2 : 1;
                        const damage = dynamax.attack * typeAffinity * dynamax.damageAttack * stabMultiplier;
                        list.push({ dynamax, damage, typeAttack });
                    });
                });
                map.set(typeOpponent, list.sortDesc('damage'));
            });
            return map;
        }),
    })),
    withComputed((store) => ({
        // Vue finale : injecte isSelected / isBadComparedToSelected sans muter la base
        _allDynamaxPokemonResultDamageBase: computed(() => {
            const base = store._baseResultDamageByType();
            const selectedKeys = store._selectedKeys();
            const map = new Map<TypePokemon, ResultDamage[]>();

            let foundSelectedGlobally = false; // ajuste si "bad compared" doit être par type plutôt que global

            base.forEach((list, type) => {
                let foundInType = false;
                const mapped = list.map((rd) => {
                    const isSelected = selectedKeys.has(resultDamageKey(rd.dynamax, rd.typeAttack));
                    if (isSelected) foundInType = true;
                    return { ...rd, isSelected, isBadComparedToSelected: foundInType };
                });
                map.set(type, mapped);
            });
            return map;
        }),
        maxDamageFind: computed(() => {
            let max = 0;
            store._baseResultDamageByType().forEach((list) => {
                list.forEach((rd) => (max = Math.max(max, rd.damage)));
            });
            return max;
        }),
    })),
    withComputed((store) => ({
        selectedPokemonArray: computed(() => {
            const result: ResultDamage[] = [];
            store._allDynamaxPokemonResultDamageBase().forEach((list) => {
                list.forEach((rd) => rd.isSelected && result.push(rd));
            });
            return result;
        }),
        finalAllDynamaxPokemonResultDamageBase: computed(() => {
            const breakPointPercent = 0.5;
            const maxDamage = store.maxDamageFind();
            const map = new Map<TypePokemon, ResultDamage[]>();
            allTypes.forEach((type) => {
                const filtered =
                    store
                        ._allDynamaxPokemonResultDamageBase()
                        .get(type)
                        ?.filter((resultDamage) => {
                            const isStab = resultDamage.dynamax.pokemon.type.includes(resultDamage.typeAttack);
                            const isSuperEffective =
                                store._typeEffectivenessService.calculEffectivness(
                                    resultDamage.typeAttack,
                                    type,
                                    type,
                                ) > 1;
                            const doEnoughDamage = resultDamage.damage >= maxDamage * breakPointPercent;
                            return (doEnoughDamage && (isStab || isSuperEffective)) || (isStab && isSuperEffective);
                        }) ?? [];
                map.set(type, filtered);
            });
            return map;
        }),
        searchPokemon: computed((): Map<TypePokemon, ResultDamage[]> | undefined => {
            if (store.search().length < 3) return;
            const map = new Map<TypePokemon, ResultDamage[]>();
            allTypes.forEach((type) => {
                const list = store._allDynamaxPokemonResultDamageBase().get(type) ?? [];
                map.set(
                    type,
                    list.filter((resultDamage) => resultDamage.dynamax.pokemon.name.slugifyIncludes(store.search())),
                );
            });
            return map;
        }),
    })),
    withMethods((store) => ({
        unselectAll() {
            patchState(store, { _selectedKeys: new Set<string>() });
        },
        selectPokemon(selected: ResultDamage) {
            const key = resultDamageKey(selected.dynamax, selected.typeAttack);
            const next = new Set(store._selectedKeys());
            next.has(key) ? next.delete(key) : next.add(key);
            patchState(store, { _selectedKeys: next });
        },
        setSearch(value: string) {
            patchState(store, { search: value });
        },
    })),
);
