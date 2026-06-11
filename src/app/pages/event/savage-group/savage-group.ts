import { Component, inject, input } from '@angular/core';
import { SavageGroup } from '@entities/event';
import { EventRepository } from '@repositories/event/event.repository';
import { StoreSavageGroup } from './store-savage-group/store-savage-group';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { TypeComponent } from '@shared/components/type/type.component';

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
