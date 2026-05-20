import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ItemEntry } from './../../../../entities/shop-packs';

interface ItemTypeConfig {
    label: string;
    icon?: string;
}

const ITEM_TYPES: Record<string, ItemTypeConfig> = {
    pass_raid_normal: { label: 'Pass' },
    pass_raid_distance: { label: 'Pass distance' },
    super_incubateur: { label: 'Super incubateur' },
    incubateur_normal: { label: 'Incubateur' },
    particule_dynamax: { label: 'Particule Dynamax' },
    oeuf_chance: { label: 'Oeuf chance' },
    poussiere_etoile: { label: "Morceau d'etoile" },
    ticket_elite: { label: 'CT elite' },
    nanana_argente: { label: 'Nanana argenté' },
};

@Component({
    selector: '[app-item-tag]',
    imports: [],
    template: `
        {{ quantity() }}× {{ label() }}
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemTag {
    readonly item = input.required<ItemEntry>();
    readonly quantity = computed(() => this.item().quantity);
    readonly type = computed(() => this.item().type);

    label(): string {
        return ITEM_TYPES[this.type()]?.label ?? this.type();
    }
}
