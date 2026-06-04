export type PriceMode = 'coins' | '22' | '44' | '110';
const _coinRates = {
    '22': 2700,
    '44': 5600,
    '110': 15500,
};

export interface PackData {
    categories: Record<string, Category>;
}
export type Category = {
    label: string;
    subCategory: SubCategory[];
    defaultSub?: string;
};

export type SubCategory = {
    key: string;
    label: string;
    mainItemTypes: string[];
    packs: RawPack[];
};

export type RawPack = {
    id: string;
    name: string;
    items: ItemEntry[];
} & (PriceCoins | PriceEuro);

type PriceCoins = {
    priceCoins: number;
    priceEuro?: never;
};

type PriceEuro = {
    priceEuro: number;
    priceCoins?: never;
};

export interface ItemEntry {
    type: keyof typeof ITEM_TYPES;
    quantity: number;
}

export interface PackRow {
    pack: Pack;
    mainItems: ItemEntry[];
    bonusItems: ItemEntry[];
    unitPrice: number;
}

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
    ct_chargé: { label: 'CT chargé', icon: 'Sprite_CT_Attaque_Chargée_GO.png' },
    ct_elite_immediate: { label: 'CT elite immédiate', icon: "Sprite_CT_Attaque_Immédiate_d'élite_GO.png" },
    ct_immediate: { label: 'CT immédiate', icon: 'Sprite_CT_Attaque_Immédiate_GO.png' },
    nanana_argente: { label: 'Nanana argenté', icon: 'Sprite_Baie_Nanana_argentée_GO.png' },
    module_leurre: { label: 'Leurre', icon: 'Sprite_Module_Leurre_GO.png' },
    module_leurre_glacial: { label: 'Leurre Glacial', icon: 'Sprite_Leurre_Glacial_GO.png' },
    module_leurre_magnetique: { label: 'Leurre Magnétique', icon: 'Sprite_Leurre_Magnétique_GO.png' },
    module_leurre_moussu: { label: 'Leurre Moussu', icon: 'Sprite_Leurre_Moussu_GO.png' },
    module_leurre_pluvieux: { label: 'Leurre Pluvieux', icon: 'Sprite_Module_Leurre_Pluvieux_GO.png' },
    poffin: { label: 'Poffin', icon: 'Sprite_Poffin_GO.png' },
    radar_rocket: { label: 'Radar', icon: 'Sprite_Radar_Rocket_GO.png' },
    super_bonbon: { label: 'Super Bonbon', icon: 'Sprite_Super_Bonbon_GO.png' },
    framby_doree: { label: 'Framby dorée', icon: 'Sprite_Baie_Framby_dorée_GO.png' },
    piece: { label: 'Piece', icon: 'Miniature_PokéPièce_GO.png' },
    potion: { label: 'Potion', icon: 'Sprite_Potion_GO.png' },
    super_potion: { label: 'Super Potion', icon: 'Sprite_Super_Potion_GO.png' },
    hyper_potion: { label: 'Hyper Potion', icon: 'Sprite_Hyper_Potion_GO.png' },
    potion_max: { label: 'Potion MAX', icon: 'Sprite_Potion_Max_GO.png' },
    rappel: { label: 'Rappel', icon: 'Sprite_Rappel_GO.png' },
    rappel_max: { label: 'Rappel MAX', icon: 'Sprite_Rappel_Max_GO.png' },
    pierre_sinnoh: { label: 'Pierre Sinnoh', icon: 'Sprite_Pierre_Sinnoh_GO.png' },
    pierre_unys: { label: 'Pierre Unys', icon: 'Sprite_Pierre_Unys_GO.png' },
    super_radar_rocket: { label: 'Super Radar Rocket', icon: 'Sprite_Super_Radar_Rocket_GO.png' },
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
