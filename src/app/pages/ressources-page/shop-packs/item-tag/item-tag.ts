import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ITEM_TYPES, ItemEntry } from './../../../../entities/shop-packs';

@Component({
    selector: '[app-item-tag]',
    imports: [],
    template: `
        {{ quantity() }}×
        @if (icon()) {
            <img
                [src]="'assets/items/' + icon()"
                [alt]="label()"
                style="height: 1.5em; vertical-align: middle"
                [title]="label()"
            />
        } @else {
            {{ label() }}
        }
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemTag {
    readonly item = input.required<ItemEntry>();
    readonly quantity = computed(() => this.item().quantity);
    readonly type = computed(() => this.item().type);
    readonly label = computed(() => ITEM_TYPES[this.type()]?.label ?? this.type());
    readonly icon = computed(() => ITEM_TYPES[this.type()]?.icon);
}
