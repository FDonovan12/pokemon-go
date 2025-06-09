import { computed, inject } from '@angular/core';
import { PokemonWithRarity, SavageGroup, SavageGroupInterface } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SortPokemonService } from '@repositories/event/sort-pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';

const initialState: SavageGroupInterface = {
    pokemons: [],
    title: '',
};

export const StoreSavageGroup = signalStore(
    withState(initialState),
    withComputed((store, getAllService = inject(PokemonRepository)) => ({
        megaPokemon: computed(() => {
            return getAllService.megaList.filter((mega) =>
                countTypeBoost(
                    mega,
                    store.pokemons().map((withRarity) => withRarity.pokemon),
                ),
            );
        }),
    })),
    withMethods((store, sortPokemonService = inject(SortPokemonService)) => ({
        setGroup(group: SavageGroup) {
            patchState(store, { ...group });
            const sortedGroup = sortPokemonService.getOrderedList(group.pokemonsFlat, store.megaPokemon());
            const withRarity = sortedGroup.map(
                (pokemon) => new PokemonWithRarity(pokemon, !!group.rarePokemons.find((p) => p.id === pokemon.id)),
            );
            patchState(store, { pokemons: withRarity });
        },
        getMegaGroups() {
            return store.megaPokemon().map((mega) => ({
                mega: mega,
                pokemonBoost: store.pokemons().filter((pokemon) => haveTypeInCommon(mega, pokemon.pokemon)),
            }));
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
