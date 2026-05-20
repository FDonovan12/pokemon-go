export type PriceMode = 'coins' | '22' | '44' | '110';
const _coinRates = {
    '22': 2700,
    '44': 5600,
    '110': 15500,
};

export interface ItemEntry {
    type: string;
    quantity: number;
}

export interface RawPack {
    id: string;
    name: string;
    items: ItemEntry[];
    priceCoins?: number;
    priceEuro?: number;
}

export interface Category {
    label: string;
    mainItemTypes: string[];
    packs: RawPack[];
}

export interface PackData {
    itemTypes: Record<string, { label: string; category: string }>;
    categories: Record<string, Category>;
}

export interface PackRow {
    pack: Pack;
    mainItems: ItemEntry[];
    bonusItems: ItemEntry[];
    unitPrice: number;
}

// ── Pack class ────────────────────────────────────────────────────────────────

export class Pack {
    readonly id: string;
    readonly name: string;
    readonly items: ItemEntry[];

    private readonly _priceCoins?: number;
    private readonly _priceEur?: number;

    constructor(raw: RawPack) {
        this.id = raw.name.slugify();
        this.name = raw.name;
        this.items = raw.items;
        this._priceCoins = raw.priceCoins;
        this._priceEur = raw.priceEuro;
    }

    isPriceCoins(): boolean {
        return this._priceCoins !== undefined;
    }

    isPriceEur(): boolean {
        return this._priceEur !== undefined;
    }

    isVisibleIn(mode: PriceMode): boolean {
        if (mode === 'coins') return this.isPriceCoins();
        return true;
    }

    /**
     * Prix en euros selon le palier choisi.
     * - Pack priceEur  : prix fixe Niantic, indépendant du palier.
     * - Pack priceCoins: converti via coinRates du palier.
     * Retourne null en mode 'coins'.
     */
    getPriceEur(tier: '22' | '44' | '110'): number | null {
        if (this._priceEur !== undefined) return this._priceEur;
        if (this._priceCoins !== undefined) {
            const rate = _coinRates[tier];
            return (this._priceCoins / rate) * parseInt(tier, 10);
        }
        return null;
    }

    /**
     * Prix brut dans l'unité native du pack (coins ou euros).
     */
    getRawPrice(): number {
        return this._priceCoins ?? this._priceEur ?? 0;
    }

    getRawPriceUnit(): string {
        return this.isPriceEur() ? '€' : 'coins';
    }

    /**
     * Prix unitaire selon le mode actif.
     * Retourne null si le pack n'est pas applicable dans ce mode.
     */
    getUnitPrice(mode: PriceMode, mainQty: number): number | null {
        if (mainQty === 0) return null;
        if (!this.isVisibleIn(mode)) return null;

        if (mode === 'coins') {
            return this._priceCoins! / mainQty;
        }

        const eur = this.getPriceEur(mode);
        return eur !== null ? eur / mainQty : null;
    }
}
