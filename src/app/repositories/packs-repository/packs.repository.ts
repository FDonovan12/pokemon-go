import { Injectable } from '@angular/core';
import raw from './pack.json';
import { PackData } from '@entities/shop-packs';

@Injectable({
    providedIn: 'root',
})
export class PacksRepository {
    getShopPacks(): PackData {
        return raw;
    }
}
