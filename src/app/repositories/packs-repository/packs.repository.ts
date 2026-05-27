import { Injectable } from '@angular/core';
import { ITEM_TYPES, PackData, RawPack } from '@entities/shop-packs';
import rawData from './pack.json';

const CATEGORIES = [
    {
        label: 'Pass Premium',
        defaultSub: 'premium',
        subCategory: [
            {
                key: 'premium',
                label: 'Premium',
                mainItemTypes: ['pass_raid_normal', 'pass_raid_distance'],
            },
            {
                key: 'remote',
                label: 'Distance',
                mainItemTypes: ['pass_raid_distance'],
            },
        ],
    },
    {
        label: 'Incubateur',
        defaultSub: 'incubateur',
        subCategory: [
            {
                key: 'incubateur',
                label: 'Incubateur',
                mainItemTypes: ['incubateur_normal', 'super_incubateur'],
            },
            {
                key: 'super_incubateur',
                label: 'Super Incubateur',
                mainItemTypes: ['super_incubateur'],
            },
        ],
    },
    {
        label: 'Particule Dynamax',
        defaultSub: 'particule',
        subCategory: [
            {
                key: 'particule',
                label: 'Particule',
                mainItemTypes: ['particule_dynamax'],
            },
        ],
    },
];
@Injectable({
    providedIn: 'root',
})
export class PacksRepository {
    getShopPacks(): PackData {
        const typedPacks = rawData.packs as RawPack[];
        const result = {
            categories: CATEGORIES.toObject(
                (category) => category.label.slugify(),
                (category) => ({
                    label: category.label,
                    defaultSub: category.defaultSub,
                    subCategory: category.subCategory.map((sub) => {
                        return {
                            key: sub.key,
                            label: sub.label,
                            mainItemTypes: sub.mainItemTypes,
                            packs: typedPacks.filter((pack) =>
                                pack.items.some((item) => item.type.slugifyIn(sub.mainItemTypes)),
                            ),
                        };
                    }),
                }),
            ),
        };
        const itemUseKey = CATEGORIES.flatMap((cate) => cate.subCategory.flatMap((sub) => sub.mainItemTypes)).unique();
        const itemsNotUse = Object.keys(ITEM_TYPES).filter((item) => !itemUseKey.includes(item));
        result.categories['autre'] = {
            label: 'Autre',
            defaultSub: '',
            subCategory: itemsNotUse
                .filter((item) => typedPacks.filter((pack) => pack.items.map((i) => i.type).includes(item)).length > 0)
                .map((item) => ({
                    key: item,
                    label: ITEM_TYPES[item].label,
                    mainItemTypes: [item],
                    packs: typedPacks.filter((pack) => pack.items.map((i) => i.type).includes(item)),
                })),
        };
        return result;
    }
}
