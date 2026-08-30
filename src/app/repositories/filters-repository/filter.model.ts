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
    isCompletelyResolved: boolean;
}

export interface FilterItemResolved {
    type: 'filter';
    id: string;
    label: string;
    query: string;
}

export interface FilterFolderResolved {
    type: 'folder';
    id: string;
    label: string;
    isOpen: boolean;
    children: FilterItemResolved[];
}

export type FilterListItemResolved = FilterItemResolved | FilterFolderResolved;

// export interface FilterItem {
//     id: string;
//     label: string;
//     query: FilterQuery;
//     folderId?: string;
//     order?: number;
// }

// export interface FolderItem {
//     id: string;
//     label: string;
//     isOpen: boolean;
//     order: number;
// }

// export type FilterListEntry =
//     | { type: 'filter'; item: FilterItemResolved }
//     | { type: 'folder'; item: FolderItem; children: FilterItemResolved[] };

export interface FilterItem {
    type: 'filter';
    id: string;
    label: string;
    query: FilterQuery;
}

export interface FilterFolder {
    type: 'folder';
    id: string;
    label: string;
    isOpen: boolean;
    children: FilterItem[];
}

export type FilterListItem = FilterItem | FilterFolder;
