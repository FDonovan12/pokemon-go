import { Component, inject, input, InputSignal } from '@angular/core';
import { pokemonsList } from '../../bdd/bdd-pokemons';
import { BddEvent } from '../../bdd/event';
import { EventInterface } from '../../entities/event';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [],
    templateUrl: './event.component.html',
    styleUrl: './event.component.css',
})
export class EventComponent {
    slug: InputSignal<string> = input.required();

    private readonly bddEvent: BddEvent = inject(BddEvent);

    event: EventInterface | undefined;

    ngOnInit(): void {
        console.log('event');
        console.log(this.slug());
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        //this.event = events.find((event) => event.slug === this.slug());
        console.log(this.bddEvent.getEventsPokemon());
        console.log(pokemonsList);
    }
}
