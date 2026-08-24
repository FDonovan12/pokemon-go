import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DynamaxApiEntry, PokemonData } from '@entities/pokemon';

@Component({
    selector: 'app-image-pokemon',
    imports: [],
    template: `
        <img
            loading="lazy"
            [src]="isShiny() ? pokemon().imageShiny : pokemon().image"
            [alt]="pokemon().slug"
            [title]="pokemon().slug"
            [style.height.px]="height()"
            [style.aspect-ratio]="'1'"
        />
    `,
    styles: `
        :host {
            display: inline-block;
            margin: 0.125em;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePokemon {
    pokemon = input.required<PokemonData | DynamaxApiEntry>();
    height = input<number>(50);
    isShiny = input<boolean>(false);
}
