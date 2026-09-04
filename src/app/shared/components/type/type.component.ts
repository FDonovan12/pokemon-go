import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypePokemon } from '@entities/pokemon';
import { IMAGES } from '@shared/assets/images.generated';

@Component({
    selector: 'app-type',
    standalone: true,
    imports: [RouterLink, NgTemplateOutlet],
    template: `
        @if (isALink()) {
            <a
                [routerLink]="[]"
                [fragment]="type()"
            >
                <ng-container [ngTemplateOutlet]="typeTemplate" />
            </a>
        } @else {
            <ng-container [ngTemplateOutlet]="typeTemplate" />
        }

        <ng-template #typeTemplate>
            @if (keepLogo()) {
                <img
                    [src]="urlType()"
                    [alt]="type()"
                    [style.transform]="'scale(' + sizePercentage() / 100 + ')'"
                    [class.selected]="isSelected()"
                />
            } @else {
                <span
                    [class]="type()"
                    [class.selected]="isSelected()"
                    [class.typeBadge]="true"
                    [style.transform]="'scale(' + sizePercentage() / 100 + ')'"
                >
                    {{ type() }}
                </span>
            }
        </ng-template>
    `,

    styles: `
        .selected {
            font-weight: bold;
            --type-bg-opacity: var(--type-bg-opacity-selected, 0.15);
            outline: hsl(var(--color-background) / 1) solid 2px;
        }
        .typeBadge {
            display: inline-block;
            padding: 0.125em 0.25em;
            border-radius: 0.375em;
            width: 8ch;
            text-align: center;
        }
    `,
    host: {
        '[style.--type-bg-opacity]': 'backgroundOpacity()',
        '[style.--type-bg-opacity-selected]': 'selectedOpacity()',
    },
})
export class TypeComponent {
    type = input.required<TypePokemon>();
    backgroundOpacity = input(0.45);
    selectedOpacity = computed(() => this.backgroundOpacity() + 0.25);
    isALink = input<boolean>(false);
    isSelected = input<boolean>(false);
    sizePercentage = input<number>(100);
    key = computed(() => this.type().slugify().capitalize() as keyof typeof IMAGES.types);
    urlType = computed(() => IMAGES.types[this.key()]);
    keepLogo = input(false);
}
