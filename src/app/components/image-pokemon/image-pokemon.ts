import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PokemonInterface } from '@entities/pokemon';

@Component({
    selector: 'app-image-pokemon',
    imports: [],
    template: `
        <img
            [src]="pokemon().image"
            [alt]="pokemon().name"
            [title]="pokemon().name"
            [style.height.px]="height() ?? 50"
            [style.aspect-ratio]="'1'"
        />
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePokemon {
    pokemon = input.required<PokemonInterface>();
    height = input<number>();
}
