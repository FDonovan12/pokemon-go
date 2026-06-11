import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypePokemon } from '@entities/pokemon';
import { IMAGES } from '@shared/assets/images.generated';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [RouterLink],
    template: '<a [routerLink]="[]" [fragment]="type()"><img [src]="urlType()" [style.width.px]="size()"/></a>',

    styles: '',
})
export class TypeComponent {
    type = input.required<TypePokemon>();
    size = input<number>();
    key = computed(() => this.type().slugify().capitalize() as keyof typeof IMAGES.types);
    urlType = computed(() => IMAGES.types[this.key()]);
}
