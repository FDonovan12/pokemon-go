import { inject, Injectable } from '@angular/core';
import { EventPokemon, PokemonWithRarity } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';
import { PokemonRepository } from '@repositories/pokemon/pokemon.repository';
import { BddEvent } from './bdd-event';
import { SortPokemonService } from './sort-pokemon-3';

@Injectable({
    providedIn: 'root',
})
export class EventRepository {
    private readonly getAllService: PokemonRepository = inject(PokemonRepository);
    private readonly bddEvent: BddEvent = inject(BddEvent);
    private readonly sortPokemonService: SortPokemonService = inject(SortPokemonService);

    getAllEventsPokemon(): EventPokemon[] {
        const result: EventPokemon[] = this.bddEvent.getEventsPokemon();

        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }

    getEventBySlug(slug: string): EventPokemon | undefined {
        const eventTemp = this.getAllEventsPokemon().find((event) => event.slug === slug);
        if (eventTemp) {
            console.log(this.getAllService.megaList);
            eventTemp.savageGroups = eventTemp.savageGroups.map((savagePokemon) => {
                savagePokemon.megas = this.getAllService.megaList.filter((mega) =>
                    this.countTypeBoost(
                        mega,
                        savagePokemon.pokemons.map((withRarity) => withRarity.pokemon),
                    ),
                );
                return savagePokemon;
            });
            eventTemp.savageGroups.forEach((group) => {
                const megas = group.megas;
                const megasGroup = megas.map((mega) => ({
                    mega: mega,
                    pokemonBoost: group.pokemonsFlat.filter((pokemon) => this.haveTypeInCommon(mega, pokemon)),
                }));
                group.megasGroup = megasGroup;
                console.log(megasGroup);
            });
            eventTemp.savageGroups.forEach((savage) => {
                const newList = this.sortPokemonService.getOrderedList(savage.pokemonsFlat, savage.megas);
                const withRarity = newList.map(
                    (pokemon) => new PokemonWithRarity(pokemon, !!savage.rarePokemons.find((p) => (p.id = pokemon.id))),
                );
                savage.pokemons = withRarity;
            });
        }
        return eventTemp;
    }

    haveTypeInCommon(pokemon1: PokemonInterface, pokemon2: PokemonInterface): boolean {
        return pokemon1.type.some((type) => type === pokemon2.type[0] || type === pokemon2.type[1]);
    }

    countTypeBoost(mega: PokemonInterface, savages: PokemonInterface[], minCount: number = 2): boolean {
        if (mega.type.length < minCount) return false;
        let totalListCount = 0;
        const listPokemonBuffPerType: any = Object.fromEntries(mega.type.map((type) => [type, []]));
        const countBoostPerType: any = mega.type.reduce((obj: any, key) => {
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
}
