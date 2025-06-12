import { Component, inject, input, InputSignal } from '@angular/core';
import { Router } from '@angular/router';
import { EventPokemon } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { Logger } from '@services/logger/logger';
import { SavageGroupComponent } from './savage-group/savage-group';

@Component({
    selector: 'app-event',
    standalone: true,
    imports: [SavageGroupComponent],
    templateUrl: './event.component.html',
    styleUrl: './event.component.css',
})
export class EventComponent {
    slug: InputSignal<string> = input.required();

    readonly bddEvent: EventRepository = inject(EventRepository);

    private readonly router: Router = inject(Router);

    private readonly logger = inject(Logger);

    event!: EventPokemon;

    viewTable = true;

    ngOnInit(): void {
        this.logger.log('Hello');
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
