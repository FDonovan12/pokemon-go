import { PokemonSlug } from '@entities/pokemon';
import { FilterItem, FilterQuery, ListItem } from '@repositories/filters-repository';
import { PvpRank } from '../../pages/pvp-rank/pvp-rank-store/pvp-rank-store';

const CURRENT_VERSION = 5;

const migrations: Record<number, () => void> = {
    1: migrateV0toV1, // listPokemon key change from string[] to LabelEntry[]
    2: migrateV1toV2, // filterPokemon add inverted boolean
    3: migrateV2toV3, // filterPokemon add id
    4: migrateV3toV4, // filterPokemon lists becomes required
    5: migrateV4toV5, // modify slug for alternative pokemon in pvpv pages
};

export function runMigrations(): void {
    const stored = localStorage.getItem('app_version');
    const currentVersion = 0;
    console.log('currentVersion', currentVersion);

    // if (currentVersion === CURRENT_VERSION) return;

    for (let v = currentVersion + 1; v <= CURRENT_VERSION; v++) {
        migrations[v]?.();
    }

    localStorage.setItem('app_version', String(CURRENT_VERSION));
}

function migrateV0toV1() {
    const STORAGE_KEY = 'pokemon-want-keep-keys';
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return;

    try {
        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) return;

        const migrated = parsed.map((item: any) => {
            if (typeof item === 'object' && 'slug' in item) return item; // already migrated
            return { label: item, slug: item.slugify() };
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch (e) {
        console.error('Migration V1->V2 failed:', e);
    }
}

function migrateV1toV2() {
    const FILTERS_STORAGE_KEY = 'user_filters';
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return;

    const lists: FilterItem[] = JSON.parse(raw);

    const migrated = lists.map((filterItem: FilterItem) => {
        const query: FilterQuery =
            typeof filterItem.query === 'string'
                ? { prefix: filterItem.query, lists: { items: [], operator: 'AND' } }
                : {
                      ...filterItem.query,
                      lists: filterItem.query.lists
                          ? {
                                ...filterItem.query.lists,
                                items: filterItem.query.lists.items.map((item: any): ListItem => {
                                    if (typeof item === 'object' && 'inverted' in item) return item;
                                    return { key: item, inverted: false };
                                }),
                            }
                          : { items: [], operator: 'AND' },
                  };

        return { label: filterItem.label, query };
    });

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(migrated));
}

function migrateV2toV3() {
    const FILTERS_STORAGE_KEY = 'user_filters';
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return;

    const lists: FilterItem[] = JSON.parse(raw);
    const needsMigration = lists.some((filter) => !filter.id);
    if (!needsMigration) return;

    const migrated = lists.map((filter) => ({
        ...filter,
        id: filter.id ?? crypto.randomUUID(),
    }));

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(migrated));
}

function migrateV3toV4() {
    const FILTERS_STORAGE_KEY = 'user_filters';
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return;

    const lists: FilterItem[] = JSON.parse(raw);
    const needsMigration = lists.some((filter) => !filter.query.lists);
    if (!needsMigration) return;

    const migrated = lists.map((filter) => ({
        ...filter,
        query: {
            ...filter.query,
            lists: filter.query.lists ?? { items: [], operator: 'AND' },
        },
    }));

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(migrated));
}

function migrateV4toV5() {
    const PVP_STORAGE_KEY = 'pokemon-pvp_rank';
    const raw = localStorage.getItem(PVP_STORAGE_KEY);
    if (!raw) return;

    const FORM_PREFIXES = ['alola', 'crowned', 'galar', 'hisui', 'rapid-strike'];

    const map = new Map(Object.entries(JSON.parse(raw)) as [PokemonSlug, PvpRank][]);

    const migrated = new Map<PokemonSlug, PvpRank>();

    for (const [slug, rank] of map) {
        const newSlug = slug.toLowerCase();

        migrated.set(newSlug as PokemonSlug, rank);
    }

    localStorage.setItem(PVP_STORAGE_KEY, JSON.stringify(Object.fromEntries(migrated)));
}
// function migrateV4toV5() {
//     const PVP_STORAGE_KEY = 'pokemon-pvp_rank';
//     const raw = localStorage.getItem(PVP_STORAGE_KEY);
//     if (!raw) return;

//     const map = new Map(Object.entries(JSON.parse(raw)) as [PokemonSlug, PvpRank][])

//                         // 'Alola'
//                         // 'Crowned'
//                         // 'Galar'
//                         // 'Hisui'
//                         // 'Rapid-strike'

//     // localStorage.setItem(PVP_STORAGE_KEY, JSON.stringify(migrated));
// }
