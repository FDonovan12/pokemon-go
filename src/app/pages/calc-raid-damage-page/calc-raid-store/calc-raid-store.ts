import { computed, effect, inject } from '@angular/core';
import { allTypes, Base, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import {
    CinematicMove,
    CinematicMovePokemon,
    FastMove,
    FastMovePokemon,
    MoveRepository,
} from '@repositories/move/move.repository';
import { MegaBase, PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';
import { withPokemonTextSearch } from '@shared/features/pokemon-search/with-pokemon-text-search.feature';

export interface MoveMeta {
    isElite: boolean;
    isMega: boolean;
}

export type DisplayFastMove = FastMove & MoveMeta;
export type DisplayCinematicMove = CinematicMove & MoveMeta;

type State = {
    selectedType: TypePokemon;
    _defenderDefense: number;
};

const initialState: State = {
    selectedType: 'Acier',
    _defenderDefense: 180,
};

const STAB_MULTIPLIER = 1.2;

export const CalcRaidStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _moveRepository: inject(MoveRepository),
        _typeEffectivenessService: inject(TypeEffectivenessService),
    })),
    withPokemonTextSearch<MegaBase>(),
    withState(initialState),
    withMethods((store) => ({
        getMoveDamage: (power: number, moveType: TypePokemon, pokemon: Base): number => {
            const stab = pokemon.types.includes(moveType) ? STAB_MULTIPLIER : 1;
            const effectiveness = store._typeEffectivenessService.calculEffectivness(
                moveType,
                store.selectedType(),
                undefined,
            );
            const attackDefenseRatio = pokemon.stats.baseAttack / store._defenderDefense();
            return Math.floor(0.5 * power * stab * effectiveness * attackDefenseRatio) + 1;
        },
        selectType(type: TypePokemon) {
            patchState(store, { selectedType: type });
        },
    })),
    withMethods((store) => ({
        getDpsForMoveset: (pokemon: Base, quick: FastMove, cinematic: CinematicMove): number => {
            const quickEnergyGain = quick.energyDelta ?? 0;
            if (quickEnergyGain <= 0) return 0; // move invalide, pas de gain d'énergie

            const quickDamage = store.getMoveDamage(quick.power, quick.pokemonType, pokemon);
            const cinematicDamage = store.getMoveDamage(cinematic.power, cinematic.pokemonType, pokemon);
            const cinematicEnergyCost = Math.abs(cinematic.energyDelta);

            const quickMoveCount = cinematicEnergyCost / quickEnergyGain;

            const cycleDamage = quickMoveCount * quickDamage + cinematicDamage;
            const cycleDurationSec = (quickMoveCount * quick.durationMs + cinematic.durationMs) / 1000;

            return cycleDamage / cycleDurationSec;
        },
    })),
    withMethods((store) => ({
        getBestDps: (pokemon: MegaBase) => {
            const quickMoveRefs: (MoveMeta & { id: FastMovePokemon })[] = [
                ...pokemon.quickMoves.map((id) => ({ id, isElite: false, isMega: false })),
                ...pokemon.eliteQuickMove.map((id) => ({ id, isElite: true, isMega: false })),
            ];

            const cinematicMoveRefs: (MoveMeta & { id: CinematicMovePokemon })[] = [
                ...pokemon.cinematicMoves.map((id) => ({ id, isElite: false, isMega: false })),
                ...pokemon.eliteCinematicMove.map((id) => ({ id, isElite: true, isMega: false })),
                ...pokemon.nonTmCinematicMoves.map((id) => ({ id, isElite: false, isMega: false })),
                ...(pokemon.megaAttack ? [{ id: pokemon.megaAttack.movementId, isElite: false, isMega: true }] : []),
            ];

            let best: { dps: number; quickMove: DisplayFastMove; cinematicMove: DisplayCinematicMove } | null = null;

            for (const quickRef of quickMoveRefs) {
                const quick = store._moveRepository.fastMove.get(quickRef.id);
                if (!quick) continue;

                for (const cinematicRef of cinematicMoveRefs) {
                    const cinematic = store._moveRepository.cinematicMove.get(cinematicRef.id);
                    if (!cinematic) continue;

                    const dps = store.getDpsForMoveset(pokemon, quick, cinematic);
                    if (!best || dps > best.dps) {
                        best = {
                            dps,
                            quickMove: { ...quick, isElite: quickRef.isElite, isMega: quickRef.isMega },
                            cinematicMove: { ...cinematic, isElite: cinematicRef.isElite, isMega: cinematicRef.isMega },
                        };
                    }
                }
            }

            return best ? { pokemon, ...best } : null;
        },
    })),
    withComputed((store) => ({
        typeList: computed(() => allTypes),
        raidRanking: computed(() =>
            store
                .searchResults()
                .map((pokemon) => {
                    return store.getBestDps(pokemon);
                })
                .filter((result): result is NonNullable<typeof result> => result !== null)
                .sort((a, b) => b.dps - a.dps),
        ),
    })),
    withHooks((store) => ({
        async onInit() {
            effect(() => {
                const allDifferentForm = store._pokemonRepository.allDifferentFormPokemonsSetting
                    .value()
                    .filter((form) => form.evolutionIds.length === 0);
                const mega = store._pokemonRepository.allMega();
                patchState(store, { _allPokemons: allDifferentForm.concat(mega) as MegaBase[] });
            });
        },
    })),
);
