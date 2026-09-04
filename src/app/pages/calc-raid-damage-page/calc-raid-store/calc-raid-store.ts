import { computed, effect, inject } from '@angular/core';
import { Base, TypePokemon } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import {
    CinematicMove,
    CinematicMovePokemon,
    FastMove,
    FastMovePokemon,
    MoveRepository,
} from '@repositories/move/move.repository';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';
import { withPokemonTextSearch } from '@shared/features/pokemon-search/with-pokemon-text-search.feature';

type State = {
    selectedType: TypePokemon | null;
};

const initialState: State = {
    selectedType: null,
};

const STAB_MULTIPLIER = 1.2;

export const CalcRaidStore = signalStore(
    { providedIn: 'root' },
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _moveRepository: inject(MoveRepository),
        _typeEffectivenessService: inject(TypeEffectivenessService),
    })),
    withPokemonTextSearch<Base>(),
    withState(initialState),
    withMethods((store) => ({
        getMoveDamage: (power: number | undefined, moveType: TypePokemon, pokemon: Base): number => {
            const stab = pokemon.types.includes(moveType) ? STAB_MULTIPLIER : 1;
            const effectiveness = store._typeEffectivenessService.calculEffectivness(moveType, undefined, undefined);
            return Math.floor(0.5 * (power ?? 0) * stab * effectiveness * pokemon.stats.baseAttack);
        },
    })),
    withMethods((store) => ({
        getDpsForMoveset: (pokemon: Base, quick: FastMove, cinematic: CinematicMove): number => {
            const quickEnergyGain = quick.energyDelta ?? 0;
            if (quickEnergyGain <= 0) return 0; // move invalide, pas de gain d'énergie

            const quickDamage = store.getMoveDamage(quick.power, quick.pokemonType, pokemon);
            const cinematicDamage = store.getMoveDamage(cinematic.power, cinematic.pokemonType, pokemon);
            const cinematicEnergyCost = Math.abs(cinematic.energyDelta ?? 0);

            const quickMoveCount = Math.ceil(cinematicEnergyCost / quickEnergyGain);

            const cycleDamage = quickMoveCount * quickDamage + cinematicDamage;
            const cycleDurationSec = (quickMoveCount * quick.durationMs + cinematic.durationMs) / 1000;

            return cycleDamage / cycleDurationSec;
        },
    })),
    withMethods((store) => ({
        getBestDps: (pokemon: Base) => {
            const quickMoveIds = [...pokemon.quickMoves, ...pokemon.eliteQuickMove];
            const cinematicMoveIds = [
                ...pokemon.cinematicMoves,
                ...pokemon.eliteCinematicMove,
                ...pokemon.nonTmCinematicMoves,
            ];

            let best: { dps: number; quickMove: FastMovePokemon; cinematicMove: CinematicMovePokemon } | null = null;

            for (const quickId of quickMoveIds) {
                const quick = store._moveRepository.fastMove.get(quickId);
                if (!quick) continue;

                for (const cinematicId of cinematicMoveIds) {
                    const cinematic = store._moveRepository.cinematicMove.get(cinematicId);
                    if (!cinematic) continue;

                    const dps = store.getDpsForMoveset(pokemon, quick, cinematic);
                    if (!best || dps > best.dps) {
                        best = { dps, quickMove: quickId, cinematicMove: cinematicId };
                    }
                }
            }

            return best ? { pokemon, ...best } : null;
        },
    })),
    withComputed((store) => ({
        raidRanking: computed(() =>
            store
                .searchResults()
                .map((pokemon) => {
                    console.log(pokemon.slug, pokemon.types);
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
                patchState(store, { _allPokemons: allDifferentForm.concat(mega) });
            });
        },
    })),
);
