import { effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { withPokemonSearch } from '../with-pokemon-search.feature';
import { Base } from '@entities/pokemon';

export const PokemonSelectStore = signalStore(
    withPokemonSearch<Base>(),
    withHooks({
        onInit(store) {
            const repository = inject(PokemonRepository);
            effect(() => {
                patchState(store, { _allPokemons: repository.allDifferentFormPokemonsSetting.value() });
            });
        },
    }),
);
