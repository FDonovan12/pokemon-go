import { Component, computed, input } from '@angular/core';
import { CinematicMove, FastMove } from '@repositories/move/move.repository';
import { TypeBadgeComponent } from '../type/type-badge.component';

@Component({
    selector: 'app-type-move',
    standalone: true,
    imports: [TypeBadgeComponent],
    template: `
        <app-type-badge
            [type]="move().pokemonType"
            [backgroundOpacity]="backgroundOpacity()"
            [isALink]="isALink()"
            [isSelected]="isSelected()"
            [sizePercentage]="sizePercentage()"
        >
            {{ move().names.fr }}{{ isElite() ? '*' : '' }}
            @if (megaLevel() > 0) {
                <sup>{{ megaLevel() }}</sup>
            }
        </app-type-badge>
    `,
    styles: `
        sup {
            font-size: 0.65em;
            line-height: 0;
            vertical-align: super;
        }
    `,
})
export class MoveComponent {
    move = input.required<FastMove | CinematicMove>();
    isElite = input.required<boolean>();
    megaLevel = input.required<number>();

    text = computed(
        () => `${this.move().names.fr}${this.isElite() ? '*' : ''}${this.megaLevel() > 0 ? this.megaLevel() : ''}`,
    );
    backgroundOpacity = input(0.45);
    isALink = input<boolean>(false);
    isSelected = input<boolean>(false);
    sizePercentage = input<number>(100);
}
