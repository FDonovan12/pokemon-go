import { computed, inject } from '@angular/core';
import { allTypes, Base, Dynamax, PokemonSlug, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { MoveRepository } from '@repositories/move/move.repository';
import { PokemonDynamaxRepository } from '@repositories/pokemon/pokemon-dynamax';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';
import { ToastService } from '@shared/features/toast/toast.service';
import { localStorageSignal } from '@shared/utils/utils';

export type ResultDamage = {
    dynamax: Dynamax;
    damage: number;
    typeAttack: TypePokemon;
    isSelected?: boolean;
    isBadComparedToSelected?: boolean;
};

const resultDamageKey = (dynamax: Dynamax, typeAttack: TypePokemon) => `${dynamax.pokemon.dexNumber}-${typeAttack}`;
type State = {
    _selectedKeys: Set<string>;
    search: string;
    selectedType: TypePokemon | null;
};

const initialState: State = {
    _selectedKeys: new Set<string>(),
    search: '',
    selectedType: null,
};

export const DynamaxStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _manuallyAddedDynamax: localStorageSignal('MANUALLY_ADDED_DYNAMAX_KEY', [] as Dynamax[], (list) =>
            list.map((raw) => new Dynamax(raw.pokemon, raw.isManual)),
        ),
        _typeEffectivenessService: inject(TypeEffectivenessService),
        _toastService: inject(ToastService),
        _pokemonDynamaxRepository: inject(PokemonDynamaxRepository),
        _moveRepository: inject(MoveRepository),
    })),
    withState(initialState),
    withComputed((store) => ({
        typeList: computed(() => [store.selectedType(), ...allTypes].compact().unique()),
        // Donnée brute, purement dérivée de finalDynamax() — jamais mutée
        _baseResultDamageByType: computed(() => {
            const dynamaxList = [...store._pokemonDynamaxRepository.finalDynamax(), ...store._manuallyAddedDynamax()];
            const map = new Map<TypePokemon, ResultDamage[]>();
            if (dynamaxList.length === 0) return map;
            allTypes.forEach((typeOpponent) => {
                const list: ResultDamage[] = [];
                dynamaxList.forEach((dynamax) => {
                    dynamax.attackType.forEach((typeAttack) => {
                        const typeAffinity = store._typeEffectivenessService.calculEffectivness(
                            typeAttack,
                            typeOpponent,
                            store.selectedType() ?? typeOpponent,
                        );
                        console.log(dynamax.pokemon);
                        const stabMultiplier = dynamax.pokemon.types.includes(typeAttack) ? 1.2 : 1;
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
            const breakPointPercent = store.selectedType() ? 0.25 : 0.5;
            const maxDamage = store.maxDamageFind();
            const map = new Map<TypePokemon, ResultDamage[]>();
            allTypes.forEach((type) => {
                const filtered =
                    store
                        ._allDynamaxPokemonResultDamageBase()
                        .get(type)
                        ?.filter((resultDamage) => {
                            const isStab = resultDamage.dynamax.pokemon.types.includes(resultDamage.typeAttack);
                            const isSuperEffective =
                                store._typeEffectivenessService.calculEffectivness(
                                    resultDamage.typeAttack,
                                    type,
                                    store.selectedType() ?? type,
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
        selectType(type: TypePokemon) {
            patchState(store, { selectedType: type });
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
        addManualDynamax(base: Base) {
            const alreadyPresent = [
                ...store._pokemonDynamaxRepository.finalDynamax(),
                ...store._manuallyAddedDynamax(),
            ].some((dynamax) => dynamax.pokemon.slug === base.slug);

            if (alreadyPresent) {
                store._toastService
                    .prepare(`${base.name} est déjà dans la liste`, `Un pokemon Deja present ne peut pas etre rajouté.`)
                    .showWarning();
                return;
            }

            const moves = store._moveRepository.fastMove.getMany(base.quickMoves.concat(base.eliteQuickMove)).compact();
            const quickMoveTypes = moves.map((move) => move.pokemonType);

            if (quickMoveTypes.length === 0) {
                store._toastService
                    .prepare(`Aucune attaque trouvée pour ${base.name}`, `Contacter un admin pour reporter ce bug.`)
                    .showWarning();
                return;
            }

            const dynamax = Dynamax.fromBase(base, quickMoveTypes);
            store._manuallyAddedDynamax.update((previous) => [...previous, dynamax]);
        },
        removeManualDynamax(slug: PokemonSlug) {
            store._manuallyAddedDynamax.update((previous) => previous.filter((d) => d.pokemon.slug !== slug));
        },
    })),
);
