import { Component, inject, input, InputSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TypeComponent } from '../../components/type/type.component';
import { EventInterface } from '../../entities/event';
import { BddEvent } from '../../repositories/event/event';
import { GetAllService, PokemonInterface } from '../../repositories/pokemon/get-all.service';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [RouterLink, TypeComponent],
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
            this.event.savagePokemons = eventTemp.savagePokemons.map((savagePokemon) => {
                savagePokemon.megas = this.getAllService.megaList.filter((mega) =>
                    this.bddEvent.countTypeBoost(mega, savagePokemon.pokemons),
                );
                return savagePokemon;
            });
            // this.megas = this.getAllService.megaList.filter((mega) =>
            //     this.bddEvent.countTypeBoost(mega, eventTemp.savagePokemons)
            // );
        } else {
            this.router.navigateByUrl('');
        }
    }
}
