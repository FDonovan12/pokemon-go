import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypePokemon } from '@entities/pokemon';
import { IMAGES } from '@shared/assets/images.generated';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [RouterLink],
    template: `
        @if (isALink()) {
            <a
                [routerLink]="[]"
                [fragment]="type()"
            >
                <img
                    [src]="urlType()"
                    [style.width.px]="size()"
                    [class.selected]="isSelected()"
                />
            </a>
        } @else {
            <img
                [src]="urlType()"
                [style.width.px]="size()"
                [class.selected]="isSelected()"
            />
        }
    `,

    styles: `
        .selected {
            transform: scale(1.2);
        }
    `,
})
export class TypeComponent {
    type = input.required<TypePokemon>();
    isALink = input<boolean>(false);
    isSelected = input<boolean>(false);
    size = input<number>();
    key = computed(() => this.type().slugify().capitalize() as keyof typeof IMAGES.types);
    urlType = computed(() => IMAGES.types[this.key()]);
}
