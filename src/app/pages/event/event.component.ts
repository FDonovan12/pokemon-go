import { Component, inject, input, InputSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventInterface } from '../../entities/event';
import { BddEvent } from '../../repositories/event/event';
import { GetAllService, PokemonInterface } from '../../repositories/pokemon/get-all.service';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './event.component.html',
    styleUrl: './event.component.css',
})
export class EventComponent {
    slug: InputSignal<string> = input.required();

    readonly bddEvent: BddEvent = inject(BddEvent);
    private readonly getAllService: GetAllService = inject(GetAllService);
    private readonly router: Router = inject(Router);

    event!: EventInterface;
    possibleMega: PokemonInterface[] = [];

    megas!: PokemonInterface[];

    ngOnInit(): void {
        const eventTemp = this.bddEvent.getEventsPokemon().find((event) => event.slug === this.slug());
        if (eventTemp) {
            this.event = eventTemp;
            this.megas = this.getAllService.megaList.filter((mega) =>
                this.bddEvent.countTypeBoost(mega, eventTemp.savagePokemons)
            );
        } else {
            this.router.navigateByUrl('');
        }
        console.log(eventTemp);
        this.findIndex(2, [0, 1, 2, 3, 4, 5, 6, 7]);
        this.findIndex(4, [0, 1, 2, 3, 4, 5, 6, 7]);
        this.findIndex(5, [0, 1, 2, 3, 4, 6, 7]);
        this.findIndex(7, [0, 1, 2, 3, 4, 5, 6, 7]);
    }

    private findIndex(number: number, list: number[]) {
        console.log(list);
        let left = 0;
        let right = list.length - 1;
        let currentIndex = Math.floor((left + right) / 2);

        while (number !== list[currentIndex] && left !== right) {
            console.log(currentIndex, left, right, list[currentIndex]);
            if (number < list[currentIndex]) {
                right = currentIndex - 1;
            } else {
                left = currentIndex + 1;
            }
            console.log(currentIndex, left, right, list[currentIndex]);
            currentIndex = Math.floor((left + right) / 2);
        }
        if (number !== list[currentIndex]) console.log('not exist');
        console.log('finale', currentIndex, 'inpout', number, '\n');
        console.log('----------------');
    }
}
