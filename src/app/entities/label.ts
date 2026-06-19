import { Brand } from './pokemon';

export type ListLabel = Brand<string, 'ListLabel'>;
export type ListSlug = Brand<string, 'ListSlug'>;
export interface LabelEntry {
    label: ListLabel;
    slug: ListSlug;
}
