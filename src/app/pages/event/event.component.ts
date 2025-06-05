import { Component, inject, input, InputSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventPokemon } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { TypeComponent } from 'app/components/type/type.component';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [RouterLink, TypeComponent],
    templateUrl: './event.component.html',
    styleUrl: './event.component.css',
})
export class EventComponent {
    slug: InputSignal<string> = input.required();

    readonly bddEvent: EventRepository = inject(EventRepository);

    private readonly router: Router = inject(Router);

    event!: EventPokemon;

    ngOnInit(): void {
        const eventTemp = this.bddEvent.getEventBySlug(this.slug());
        if (eventTemp) {
            this.event = eventTemp;
        } else {
            this.router.navigateByUrl('');
        }
    }
}
