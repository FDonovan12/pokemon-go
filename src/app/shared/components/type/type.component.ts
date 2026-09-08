import { Component, input } from '@angular/core';
import { TypePokemon } from '@entities/pokemon';
import { TypeBadgeComponent } from './type-badge.component';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [TypeBadgeComponent],
    template: `
        <app-type-badge
            [type]="type()"
            [backgroundOpacity]="backgroundOpacity()"
            [isALink]="isALink()"
            [isSelected]="isSelected()"
            [sizePercentage]="sizePercentage()"
            [keepLogo]="keepLogo()"
        >
            {{ type() }}
        </app-type-badge>
    `,
})
export class TypeComponent {
    type = input.required<TypePokemon>();
    backgroundOpacity = input(0.45);
    isALink = input<boolean>(false);
    isSelected = input<boolean>(false);
    sizePercentage = input<number>(100);
    keepLogo = input(false);
}
