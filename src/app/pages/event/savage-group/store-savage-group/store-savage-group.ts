import { computed, inject } from '@angular/core';
import { PokemonWithRarity, SavageGroup } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { SortPokemonService } from '@services/sort-pokemon/sort-pokemon';
export interface SavageGroupInterface {
    pokemons: PokemonWithRarity[];
    title: string | undefined;
}
const initialState: SavageGroupInterface = {
    pokemons: [],
    title: '',
};

export const StoreSavageGroup = signalStore(
    withProps(() => ({
        _pokemonRepository: inject(PokemonRepository),
        _sortPokemonService: inject(SortPokemonService),
    })),
    withState(initialState),
    withComputed((store) => ({
        megaPokemon: computed(() => {
            return store._pokemonRepository.megaList.filter((mega) =>
                countTypeBoost(
                    mega,
                    store.pokemons().map((withRarity) => withRarity.pokemon),
                ),
            );
        }),
    })),
    withComputed((store) => ({
        sortedGroup: computed(() => store._sortPokemonService.getOrderedList(store.pokemons(), store.megaPokemon())),
        getMegaGroups: computed(() => {
            return store.megaPokemon().map((mega) => ({
                mega: mega,
                pokemonBoost: store.pokemons().filter((pokemon) => haveTypeInCommon(mega, pokemon.pokemon)),
            }));
        }),
    })),
    withMethods((store) => ({
        setGroup(group: SavageGroup) {
            patchState(store, { pokemons: group.pokemons, title: group.title });
        },
        shuffleGroup() {
            patchState(store, { pokemons: store.pokemons().shuffle() });
        },
    })),
);

function haveTypeInCommon(pokemon1: PokemonInterface, pokemon2: PokemonInterface): boolean {
    return pokemon1.type.some((type) => type === pokemon2.type[0] || type === pokemon2.type[1]);
}

function countTypeBoost(mega: PokemonInterface, savages: PokemonInterface[], minCount: number = 2): boolean {
    if (mega.type.length < minCount) return false;
    let totalListCount = 0;
    const listPokemonBuffPerType: Record<string, PokemonInterface[]> = Object.fromEntries(
        mega.type.map((type) => [type, []]),
    );
    const countBoostPerType: Record<string, number> = mega.type.reduce((obj: any, key) => {
        obj[key] = 0;
        return obj;
    }, {});
    savages.forEach((savage) => {
        let boost = false;
        mega.type.forEach((type) => {
            if (savage.type.includes(type)) {
                countBoostPerType[type]++;
                listPokemonBuffPerType[type].push(savage);
                boost = true;
            }
        });
        if (boost) totalListCount++;
    });
    let maxLength = Math.max(...Object.values(listPokemonBuffPerType).map((list: any) => list.length));

    return maxLength < totalListCount;
}
