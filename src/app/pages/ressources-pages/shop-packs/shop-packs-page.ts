import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Pack, PackData, PackRow, PriceMode } from '@entities/shop-packs';
import { PacksRepository } from '@repositories/packs-repository/packs.repository';

@Component({
    selector: 'app-shop-packs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shop-packs-page.html',
    styleUrl: './shop-packs-page.css',
})
export class ShopPacksComponent implements OnInit {
    private readonly _packsRepository = inject(PacksRepository);

    data: PackData = this._packsRepository.getShopPacks();

    categoryKeys: string[] = [];
    activeCategory: string = '';

    priceMode: PriceMode = 'coins';

    rows: PackRow[] = [];

    readonly priceModes: { label: string; value: PriceMode }[] = [
        { label: 'Pièces', value: 'coins' },
        { label: '22€', value: '22' },
        { label: '44€', value: '44' },
        { label: '110€', value: '110' },
    ];

    ngOnInit(): void {
        this.categoryKeys = Object.keys(this.data.categories);
        this.activeCategory = this.categoryKeys[0];
        this.buildRows();
    }

    get priceUnit(): string {
        return this.priceMode === 'coins' ? 'coins' : '€';
    }

    getItemLabel(type: string): string {
        return this.data.itemTypes[type]?.label ?? type;
    }

    formatPrice(val: number | null): string {
        if (val === null || !isFinite(val)) return '—';
        return this.priceMode === 'coins' ? val.toFixed(1) : val.toFixed(3);
    }

    selectCategory(key: string): void {
        this.activeCategory = key;
        this.buildRows();
    }

    selectPriceMode(mode: PriceMode): void {
        this.priceMode = mode;
        this.buildRows();
    }

    buildRows(): void {
        const category = this.data.categories[this.activeCategory];
        const mainTypes = new Set(category.mainItemTypes);

        const rows: PackRow[] = category.packs
            .map((raw) => new Pack(raw))
            .filter((pack) => pack.isVisibleIn(this.priceMode))
            .map((pack) => {
                const mainItems = pack.items.filter((i) => mainTypes.has(i.type));
                const bonusItems = pack.items.filter((i) => !mainTypes.has(i.type));
                const totalMainQty = mainItems.reduce((sum, i) => sum + i.quantity, 0);
                const unitPrice = pack.getUnitPrice(this.priceMode, totalMainQty) ?? Infinity;
                if (pack.name.slugifyIncludes('fest')) {
                    console.log(mainItems);
                    console.log(bonusItems);
                }

                return { pack, mainItems, bonusItems, unitPrice };
            })
            .sortAsc((row) => row.unitPrice);

        this.rows = rows;
    }
}
