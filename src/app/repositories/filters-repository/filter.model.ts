export type ListKey = string;

export interface ListItem {
    key: ListKey;
    inverted: boolean;
}

export interface ListCondition {
    operator: 'AND' | 'OR';
    items: ListItem[];
}

export interface FilterQuery {
    prefix: string;
    lists: ListCondition;
}

export interface FilterItem {
    id: string;
    label: string;
    query: FilterQuery;
}

export interface FilterItemResolved {
    id: string;
    label: string;
    query: string; // Toujours un string pour le composant
}
