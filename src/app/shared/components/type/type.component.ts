import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypePokemon } from '@entities/pokemon';

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

    urlType = computed(() => `https://www.pokebip.com/pokedex/images/${this.type().slugify().capitalize()}.png`);
}
