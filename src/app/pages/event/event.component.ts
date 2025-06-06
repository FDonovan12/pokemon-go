import { Component, inject, input, InputSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TypeComponent } from '@components/type/type.component';
import { EventPokemon } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { SavageGroupComponent } from './savage-group/savage-group';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [RouterLink, TypeComponent, SavageGroupComponent],
    templateUrl: './event.component.html',
    styleUrl: './event.component.css',
})
export class EventComponent {
    slug: InputSignal<string> = input.required();

    readonly bddEvent: EventRepository = inject(EventRepository);

    private readonly router: Router = inject(Router);

    event!: EventPokemon;

    viewTable = true;

    ngOnInit(): void {
        const eventTemp = this.bddEvent.getEventBySlug(this.slug());
        if (eventTemp) {
            this.event = eventTemp;
        } else {
            this.router.navigateByUrl('');
        }
    }

    toggleView(): void {
        this.viewTable = !this.viewTable;
    }
}
