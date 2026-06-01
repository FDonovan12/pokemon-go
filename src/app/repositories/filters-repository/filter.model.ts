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
    lists?: ListCondition;
}

export interface FilterItem {
    label: string;
    query: FilterQuery | string; // Support l'ancien format string et le nouveau
}

export interface FilterItemResolved {
    label: string;
    query: string; // Toujours un string pour le composant
}
