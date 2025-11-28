import { computed, inject } from '@angular/core';
import { allTypes, Dynamax, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonDynamaxRepository } from '@repositories/pokemon/pokemon-dynamax';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { LocalStorageService } from '@services/local-storage-service/local-storage-service';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';

const LOCAL_STORAGE_DYNAMAX_KEY = 'pokemon-dynamax-key';

export type ResultDamage = {
    dynamax: Dynamax;
    damage: number;
    typeAttack: TypePokemon;
    isSelected?: boolean;
    isBadComparedToSelected?: boolean;
};

const initialState = {
    allDynamaxPokemonResultDamageBase: new Map<TypePokemon, ResultDamage[]>(),
    maxDamageFind: 0,
    _selectedPokemon: new Set<ResultDamage>(),
    bestSelectedPokemonByType: new Map<TypePokemon, ResultDamage>(),
    search: '',
};

export const DynamaxStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _typeEffectivenessService: inject(TypeEffectivenessService),
        _pokemonDynamaxRepository: inject(PokemonDynamaxRepository),
        _localStorageService: inject(LocalStorageService),
    })),
    withState(initialState),
    withComputed((store) => ({
        selectedPokemonArray: computed(() => {
            console.log('test array');
            return [...store._selectedPokemon()];
        }),
    })),
    withComputed((store) => ({})),
    withMethods((store) => ({
        unselectAll() {
            patchState(store, { _selectedPokemon: new Set<ResultDamage>() });
        },
        selectPokemon(selectedPokemon: ResultDamage) {
            const map = store.allDynamaxPokemonResultDamageBase();

            allTypes.forEach((type) => {
                const list = map.get(type);
                if (!list) return;

                let found = false;

                list.forEach((resultDamage) => {
                    if (isSameResultDamage(resultDamage, selectedPokemon)) {
                        resultDamage.isSelected = !resultDamage.isSelected;
                    }
                    if (resultDamage.isSelected) found = true;
                    resultDamage.isBadComparedToSelected = found;
                });
            });
            patchState(store, {
                allDynamaxPokemonResultDamageBase: new Map(map),
            });
        },
        setSearch: (value: string) => patchState(store, { search: value }),
        _getDamage(dynamax: Dynamax, typeAttck: TypePokemon, typeOpponent: TypePokemon): number | null {
            const typeAffinity = store._typeEffectivenessService.calculEffectivness(
                typeAttck,
                typeOpponent,
                typeOpponent,
            );
            const stabMultiplier = dynamax.pokemon.type.includes(typeAttck) ? 1.2 : 1;
            const notBoostEnough = typeAffinity <= 1 && stabMultiplier === 1;
            if (notBoostEnough) return null;
            const damage = dynamax.attack * typeAffinity * dynamax.damageAttack * stabMultiplier;
            const newMaxDamage = Math.max(store.maxDamageFind(), damage);
            patchState(store, { maxDamageFind: newMaxDamage });
            return damage;
        },
    })),
    withMethods((store) => ({
        _addResultDamage(dynamax: Dynamax, typeOpponent: TypePokemon): void {
            if (!store.allDynamaxPokemonResultDamageBase().has(typeOpponent))
                store.allDynamaxPokemonResultDamageBase().set(typeOpponent, []);
            const listDamage: ResultDamage[] = store.allDynamaxPokemonResultDamageBase().get(typeOpponent)!;

            dynamax.attackType.forEach((typeAttack) => {
                const damage = store._getDamage(dynamax, typeAttack, typeOpponent);
                if (damage != null) listDamage.push({ dynamax, damage, typeAttack });
            });
        },
    })),
    withHooks((store) => ({
        onInit() {
            allTypes.forEach((type) => {
                store._pokemonDynamaxRepository
                    .getDynamaxPokemon()
                    .forEach((dynamax) => store._addResultDamage(dynamax, type));
            });
            const breakPointPercent = 0.5;
            allTypes.forEach((type) => {
                store.allDynamaxPokemonResultDamageBase().set(
                    type,
                    store
                        .allDynamaxPokemonResultDamageBase()
                        .get(type)
                        ?.filter((resultDamage) => resultDamage.damage >= store.maxDamageFind() * breakPointPercent)
                        .sortDesc('damage')!,
                );
            });
        },
    })),
);

function isSameResultDamage(resultDamage1: ResultDamage, resultDamage2: ResultDamage): boolean {
    return (
        resultDamage1.dynamax.pokemon.id === resultDamage2.dynamax.pokemon.id &&
        resultDamage1.typeAttack === resultDamage2.typeAttack
    );
}

function thisDynamaxIsSelected(resultDamage: ResultDamage, iterableResulatDamage: Iterable<ResultDamage>): boolean {
    return [...iterableResulatDamage].some((item) => isSameResultDamage(item, resultDamage));
}
