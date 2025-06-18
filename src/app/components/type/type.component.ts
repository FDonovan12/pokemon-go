import { Component, computed, input } from '@angular/core';
import { TypePokemon } from '@entities/pokemon';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [],
    template: '<span><img [src]="urlType()" [style.width.px]="size()"/></span>',
    styles: '',
})
export class TypeComponent {
    type = input.required<TypePokemon>();
    size = input<number>();

    urlType = computed(() => `https://www.pokebip.com/pokedex/images/${this.type().slugify().capitalize()}.png`);
}
