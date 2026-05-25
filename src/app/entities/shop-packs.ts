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
type PriceCoins = {
    priceCoins: number;
    priceEuro?: never;
};

type PriceEuro = {
    priceEuro: number;
    priceCoins?: never;
};

export type RawPack = {
    id: string;
    name: string;
    items: ItemEntry[];
} & (PriceCoins | PriceEuro);

export interface PackRow {
    pack: Pack;
    mainItems: ItemEntry[];
    bonusItems: ItemEntry[];
    unitPrice: number;
}

export type SubCategory = {
    key: string;
    label: string;
    mainItemTypes: string[];
    packs: RawPack[];
};
export interface PackData {
    categories: Record<string, Category>;
}
export type Category = {
    label: string;
    subCategory: SubCategory[];
    defaultSub: string;
};

export interface ItemTypeConfig {
    label: string;
    icon?: string;
    basePrice?: number;
}

export const ITEM_TYPES: Record<string, ItemTypeConfig> = {
    pass_raid_normal: { label: 'Pass premium', icon: 'Sprite_Passe_de_combat_premium_GO.png', basePrice: 100 },
    pass_raid_distance: { label: 'Pass distance', icon: 'Sprite_Passe_de_Raid_à_Distance_GO.png', basePrice: 195 },
    super_incubateur: { label: 'Super incubateur', icon: 'Sprite_Super-Incubateur_GO.png', basePrice: 200 },
    incubateur_normal: { label: 'Incubateur', icon: 'Sprite_Incubateur_GO.png', basePrice: 150 },
    particule_dynamax: { label: 'Particule Dynamax', icon: 'Pack_de_Particules_Max_GO.png', basePrice: 150 },
    stockage_pokemon: { label: 'Stockage Pokemon', icon: 'Sprite_Stockage_de_Pokémon_GO.png', basePrice: 200 },
    stockage_item: { label: 'Stockage Objet', icon: 'Sprite_Sac_GO.png', basePrice: 200 },
    oeuf_chance: { label: 'Oeuf chance', icon: 'Sprite_Œuf_Chance_GO.png' },
    morceau_d_etoile: { label: "Morceau d'etoile", icon: "Sprite_Morceau_d'étoile_GO.png" },
    encens: { label: 'Encens', icon: 'Sprite_Encens_GO.png' },
    ct_elite_chargé: { label: 'CT elite chargé', icon: "Sprite_CT_Attaque_Chargée_d'élite_GO.png" },
    nanana_argente: { label: 'Nanana argenté', icon: 'Sprite_Baie_Nanana_argentée_GO.png' },
};

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

    getBasePriceValue(): number {
        return this.items.sum((item) => item.quantity * (ITEM_TYPES[item.type].basePrice ?? 0));
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
