import { effect, inject } from '@angular/core';
import { PokemonData } from '@entities/pokemon';
import { patchState, signalStore, withHooks } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { withPokemonSearch } from '../with-pokemon-search.feature';

export const PokemonSelectStore = signalStore(
    withPokemonSearch<PokemonData>(),
    withHooks({
        onInit(store) {
            const repository = inject(PokemonRepository);
            effect(() => {
                patchState(store, { _allPokemons: repository.allDifferentFormPokemonsSetting.value() });
            });
        },
    }),
);
