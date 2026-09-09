import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TypePokemon } from '@entities/pokemon';
import { IMAGES } from '@shared/assets/images.generated';

@Component({
    selector: 'app-type-badge',
    standalone: true,
    imports: [RouterLink, NgTemplateOutlet],
    template: `
        @if (isALink()) {
            <a
                [routerLink]="[]"
                [fragment]="type()"
            >
                <ng-container [ngTemplateOutlet]="badgeTemplate" />
            </a>
        } @else {
            <ng-container [ngTemplateOutlet]="badgeTemplate" />
        }

        <ng-template #badgeTemplate>
            @if (keepLogo()) {
                <img
                    [src]="urlType()"
                    [alt]="type()"
                    [style.fontSize.%]="sizePercentage()"
                    [class.selected]="isSelected()"
                />
            } @else {
                <span
                    [class]="type()"
                    [class.selected]="isSelected()"
                    [class.typeBadge]="true"
                    [style.fontSize.%]="sizePercentage()"
                >
                    <span style="display: inline-block; transform: translateY(2px)">
                        <ng-content />
                    </span>
                </span>
            }
        </ng-template>
    `,
    styles: `
        .typeBadge.selected {
            font-weight: bold;
            --type-bg-opacity: var(--type-bg-opacity-selected, 0.15);
            border-color: hsl(var(--color-background) / 1);
        }
        .typeBadge {
            display: inline-block;
            padding: 0px 0.125em;
            border-radius: 0.375em;
            border: 2px solid transparent;
            text-align: center;
            min-width: var(--type-badge-width, auto);
        }
    `,
    host: {
        '[style.--type-bg-opacity]': 'backgroundOpacity()',
        '[style.--type-bg-opacity-selected]': 'selectedOpacity()',
    },
})
export class TypeBadgeComponent {
    type = input.required<TypePokemon>();
    backgroundOpacity = input(0.45);
    selectedOpacity = computed(() => this.backgroundOpacity() + 0.25);
    isALink = input<boolean>(false);
    isSelected = input<boolean>(false);
    sizePercentage = input<number>(100);
    keepLogo = input(false);

    key = computed(() => this.type().slugify().capitalize() as keyof typeof IMAGES.types);
    urlType = computed(() => IMAGES.types[this.key()]);
}
