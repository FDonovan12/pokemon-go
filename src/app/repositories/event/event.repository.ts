import { inject, Injectable } from '@angular/core';
import { EventPokemon } from '@entities/event';
import { PokemonInterface } from '@entities/pokemon';
import { BddEvent } from './bdd-event';

@Injectable({
    providedIn: 'root',
})
export class EventRepository {
    private readonly bddEvent: BddEvent = inject(BddEvent);

    getAllEventsPokemon(): EventPokemon[] {
        const result: EventPokemon[] = this.bddEvent.getEventsPokemon();

        result.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        return result;
    }

    getEventBySlug(slug: string): EventPokemon | undefined {
        const eventTemp = this.getAllEventsPokemon().find((event) => event.slug === slug);
        return eventTemp;
    }

    haveTypeInCommon(pokemon1: PokemonInterface, pokemon2: PokemonInterface): boolean {
        return pokemon1.type.some((type) => type === pokemon2.type[0] || type === pokemon2.type[1]);
    }
}
