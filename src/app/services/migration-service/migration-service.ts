import { FilterItem, FilterQuery, ListItem } from '@repositories/filters-repository';

const CURRENT_VERSION = 2;

const migrations: Record<number, () => void> = {
    1: migrateV0toV1, // listPokemon key change from string[] to LabelEntry[]
    2: migrateV1toV2, // filterPokemon add inverted boolean
};

export function runMigrations(): void {
    const stored = localStorage.getItem('app_version');
    const currentVersion = stored ? parseInt(stored) : 0;
    console.log('currentVersion', currentVersion);

    if (currentVersion === CURRENT_VERSION) return;

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
                ? { prefix: filterItem.query }
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
                          : undefined,
                  };

        return { label: filterItem.label, query };
    });

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(migrated));
}
