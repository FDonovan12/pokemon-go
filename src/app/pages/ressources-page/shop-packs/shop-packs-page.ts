import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { Category, Pack, PackData, PackRow, PriceMode } from '@entities/shop-packs';
import { PacksRepository } from '@repositories/packs-repository/packs.repository';
import { SubCategory } from './../../../entities/shop-packs';
import { ItemTag } from './item-tag/item-tag';

@Component({
    selector: 'app-shop-packs',
    standalone: true,
    imports: [CommonModule, ItemTag],
    templateUrl: './shop-packs-page.html',

    styleUrl: './shop-packs-page.css',
})
export class ShopPacksComponent {
    private readonly _packsRepository = inject(PacksRepository);

    data: PackData = this._packsRepository.getShopPacks();

    categoryKeys: string[] = Object.keys(this.data.categories);

    activeCategoryKey: WritableSignal<string> = signal(this.categoryKeys[0]);
    activeCategory: Signal<Category> = computed(() => this.data.categories[this.activeCategoryKey()]);

    currentSubsKey: Signal<string[]> = computed(() => this.activeCategory().subCategory.map((sub) => sub.key));
    activeSubsKey: WritableSignal<string> = linkedSignal(
        () => this.activeCategory().defaultSub ?? this.activeCategory().subCategory[0].key,
    );
    activeSubs: Signal<SubCategory> = computed(
        () =>
            this.activeCategory().subCategory.find((sub) => sub.key === this.activeSubsKey()) ??
            this.activeCategory().subCategory[0],
    );

    priceMode: WritableSignal<PriceMode> = signal('coins');

    rows: Signal<PackRow[]> = computed(() => {
        const category = this.activeSubs();
        const mainTypes = new Set(category.mainItemTypes);

        const rows: PackRow[] = category.packs
            .map((raw) => new Pack(raw))
            .filter((pack) => pack.isVisibleIn(this.priceMode()))
            .map((pack) => {
                const mainItems = pack.items.filter((i) => mainTypes.has(i.type));
                const bonusItems = pack.items.filter((i) => !mainTypes.has(i.type));
                const totalMainQty = mainItems.sum('quantity');
                const unitPrice = pack.getUnitPrice(this.priceMode(), totalMainQty) ?? Infinity;
                // const unitPrice = pack.getRawPrice() / pack.getBasePriceValue();

                return { pack, mainItems, bonusItems, unitPrice };
            })
            .sortAsc('unitPrice');
        return rows;
    });

    readonly priceModes: { label: string; value: PriceMode }[] = [
        { label: 'Pièces', value: 'coins' },
        { label: '22€', value: '22' },
        { label: '44€', value: '44' },
        { label: '110€', value: '110' },
    ];

    get priceUnit(): string {
        return this.priceMode() === 'coins' ? 'coins' : '€';
    }

    formatPrice(val: number | null): string {
        if (val === null || !isFinite(val)) return '—';
        return this.priceMode() === 'coins' ? val.toFixed(1) : val.toFixed(3);
    }

    selectCategory(key: string): void {
        this.activeCategoryKey.set(key);
    }

    selectSubCategory(key: string): void {
        this.activeSubsKey.set(key);
    }

    getSubCategoryLabel(key: string): string {
        return this.activeCategory().subCategory.find((sub) => sub.key === key)?.label ?? '';
    }

    selectPriceMode(mode: PriceMode): void {
        this.priceMode.set(mode);
    }
}
