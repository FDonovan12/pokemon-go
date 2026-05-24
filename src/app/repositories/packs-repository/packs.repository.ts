import { Injectable } from '@angular/core';
import { PackData } from '@entities/shop-packs';
import rawData from './pack.json';

const CATEGORIES = [
    { label: 'Pass Premium', mainItemTypes: ['pass_raid_normal', 'pass_raid_distance'] },
    { label: 'Incubateur', mainItemTypes: ['super_incubateur', 'incubateur_normal'] },
    { label: 'Particule Dynamax', mainItemTypes: ['particule_dynamax'] },
];
@Injectable({
    providedIn: 'root',
})
export class PacksRepository {
    getShopPacks(): PackData {
        return {
            categories: CATEGORIES.toObject(
                (category) => category.label.slugify(),
                (category) => ({
                    label: category.label,
                    mainItemTypes: category.mainItemTypes,
                    packs: rawData.packs.filter((pack) =>
                        pack.items.some((item) => item.type.slugifyIn(category.mainItemTypes)),
                    ),
                }),
            ),
        };
    }
}
