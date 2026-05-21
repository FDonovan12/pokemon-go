import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ItemEntry } from './../../../../entities/shop-packs';

interface ItemTypeConfig {
    label: string;
    icon?: string;
}

const ITEM_TYPES: Record<string, ItemTypeConfig> = {
    pass_raid_normal: { label: 'Pass premium', icon: 'Sprite_Passe_de_combat_premium_GO.png' },
    pass_raid_distance: { label: 'Pass distance', icon: 'Sprite_Passe_de_Raid_à_Distance_GO.png' },
    super_incubateur: { label: 'Super incubateur', icon: 'Sprite_Super-Incubateur_GO.png' },
    incubateur_normal: { label: 'Incubateur', icon: 'Sprite_Incubateur_GO.png' },
    particule_dynamax: { label: 'Particule Dynamax', icon: 'Pack_de_Particules_Max_GO.png' },
    oeuf_chance: { label: 'Oeuf chance', icon: 'Sprite_Œuf_Chance_GO.png' },
    poussiere_etoile: { label: "Morceau d'etoile", icon: "Sprite_Morceau_d'étoile_GO.png" },
    ct_elite_chargé: { label: 'CT elite chargé', icon: "Sprite_CT_Attaque_Chargée_d'élite_GO.png" },
    nanana_argente: { label: 'Nanana argenté', icon: 'Sprite_Baie_Nanana_argentée_GO.png' },
};

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
