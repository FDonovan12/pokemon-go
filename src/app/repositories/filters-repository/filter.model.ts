import { ListKey } from '@repositories/list-pokemon-repository/list-pokemon.repository';

export interface ListCondition {
    operator: 'AND' | 'OR';
    items: ListKey[];
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
