import { Component, inject, input } from '@angular/core';
import { TypeComponent } from '@components/type/type.component';
import { SavageGroup } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { StoreSavageGroup } from './store-savage-group/store-savage-group';

@Component({
    selector: 'app-savage-group',
    imports: [TypeComponent],
    templateUrl: './savage-group.html',
    styleUrl: './savage-group.css',
    providers: [StoreSavageGroup],
})
export class SavageGroupComponent {
    group = input.required<SavageGroup>();
    viewTable = input.required<boolean>();

    readonly eventRepository: EventRepository = inject(EventRepository);
    readonly store = inject(StoreSavageGroup);

    ngOnInit() {
        this.store.setGroup(this.group());
        console.log(this.viewTable());
    }
}
