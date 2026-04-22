import { Component, inject, input } from '@angular/core';
import { SavageGroup } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { TypeComponent } from 'app/shared/components/type/type.component';
import { StoreSavageGroup } from './store-savage-group/store-savage-group';

@Component({
    selector: 'app-savage-group',
    imports: [TypeComponent, ImagePokemon],
    templateUrl: './savage-group.html',
    styleUrl: './savage-group.css',
    providers: [StoreSavageGroup],
})
export class SavageGroupComponent {
    group = input.required<SavageGroup>();
    viewTable = input.required<boolean>();

    protected readonly eventRepository: EventRepository = inject(EventRepository);
    protected readonly store = inject(StoreSavageGroup);

    ngOnInit() {
        this.store.setGroup(this.group());
    }
}
