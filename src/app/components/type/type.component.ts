import { Component, computed, input } from '@angular/core';
import { TypePokemon } from '@entities/pokemon';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [],
    template: '<span><img [src]="urlType()"/></span>',
    styles: '',
})
export class TypeComponent {
    type = input.required<TypePokemon>();

    urlType = computed(() => `https://www.pokebip.com/pokedex/images/${this.type().slugify().capitalize()}.png`);
}
